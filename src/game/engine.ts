import { ALL_IDS, COUNTIES } from "../data/countyData";
import { PLAYERS } from "../data/players";
import type { OwnerId, PlayerId } from "../data/players";
import { DIFFICULTY_PROFILES } from "./difficulty";
import type { Difficulty } from "./difficulty";
import type { GameState, LogEntry, ModalInfo, MoveResult, RuntimePlayer } from "./types";

export const MAX_STACK = 99;
export const MAX_TURNS = 220;
// Every power figure below (starting armies, per-turn gains, AI scoring weights) is tuned
// against a 30-power ceiling and scaled up by this ratio to match the new 99-power cap.
const POWER_SCALE = MAX_STACK / 30;
export const START_ARMY = Math.round(10 * POWER_SCALE);
export const MAX_MOVES_PER_TURN = 3;

function rand(a: number, b: number): number {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function scalePower(n: number): number {
  return Math.round(n * POWER_SCALE);
}

export function createInitialState(difficulty: Difficulty = "hard", roles?: Record<PlayerId, boolean>): GameState {
  const owner: Record<string, OwnerId> = {};
  const army: Record<string, number> = {};
  ALL_IDS.forEach((id) => {
    owner[id] = "neutral";
    army[id] = scalePower(COUNTIES[id].pop + rand(1, 3));
  });
  PLAYERS.forEach((p) => {
    owner[p.capital] = p.id;
    army[p.capital] = START_ARMY;
  });

  const players: RuntimePlayer[] = PLAYERS.map((p) => ({
    id: p.id,
    name: p.name,
    isHuman: roles ? roles[p.id] : p.isHuman,
    capital: p.capital,
    eliminated: false,
  }));

  const state: GameState = {
    turn: 1,
    difficulty,
    owner,
    army,
    players,
    currentPlayerIndex: 0,
    selected: null,
    movesUsed: 0,
    usedSources: new Set(),
    usedDestinations: new Set(),
    blinkingCounty: null,
    pendingAiMove: null,
    log: [],
    gameOver: false,
    modal: null,
  };
  pushLog(state, `Turn 1 begins. Four provinces rise to claim the island.`, "turn-marker");
  return state;
}

export function pushLog(state: GameState, msg: string, cls?: string): void {
  state.log.push({ msg, cls: cls || "log-entry" } as LogEntry);
  if (state.log.length > 200) state.log.shift();
}

export function getPlayer(state: GameState, id: OwnerId): RuntimePlayer | undefined {
  return state.players.find((p) => p.id === id);
}

export function currentPlayer(state: GameState): RuntimePlayer {
  return state.players[state.currentPlayerIndex];
}

export function isActivePlayer(p: RuntimePlayer): boolean {
  return !p.eliminated;
}

export function countyCount(state: GameState, pid: OwnerId): number {
  return ALL_IDS.filter((id) => state.owner[id] === pid).length;
}

export function armyTotal(state: GameState, pid: OwnerId): number {
  return ALL_IDS.filter((id) => state.owner[id] === pid).reduce((s, id) => s + state.army[id], 0);
}

function isFrontline(state: GameState, id: string, pid: OwnerId): boolean {
  return COUNTIES[id].neighbors.some((n) => state.owner[n] !== pid);
}

/** Whether `pid` still has any legal source county to march from this phase. */
function hasValidMove(state: GameState, pid: OwnerId): boolean {
  return ALL_IDS.some((id) => {
    if (state.owner[id] !== pid) return false;
    if (state.army[id] < 1) return false;
    if (state.usedSources.has(id) || state.usedDestinations.has(id)) return false;
    return COUNTIES[id].neighbors.length > 0;
  });
}

// ---------- Combat ----------
export function executeMove(state: GameState, fromId: string, toId: string, pid: OwnerId): MoveResult {
  const movingArmy = state.army[fromId];
  if (movingArmy < 1) return { ok: false };
  const toOwner = state.owner[toId];
  const mover = getPlayer(state, pid)!;

  if (toOwner === pid) {
    // Only draw what's needed to bring the destination to the cap — the rest stays home.
    const needed = Math.max(0, MAX_STACK - state.army[toId]);
    const sent = Math.min(movingArmy, needed);
    state.army[toId] += sent;
    state.army[fromId] = movingArmy - sent;
    if (sent > 0) {
      pushLog(state, `${mover.name} reinforces ${COUNTIES[toId].name} with ${sent} (now ${state.army[toId]}).`);
    } else {
      pushLog(state, `${mover.name}'s ${COUNTIES[toId].name} is already at full strength (${MAX_STACK}).`);
    }
    return { ok: true, type: "reinforce" };
  }

  state.army[fromId] = 0;
  const defense = state.army[toId];
  if (movingArmy > defense) {
    const leftover = movingArmy - defense;
    state.owner[toId] = pid;
    state.army[toId] = leftover;
    const defenderName = toOwner !== "neutral" ? ` (${getPlayer(state, toOwner)!.name})` : "";
    pushLog(
      state,
      `${mover.name} storms ${COUNTIES[toId].name}${defenderName} — victorious, ${leftover} remain.`,
      "capture"
    );
    checkElimination(state, toOwner);
    return { ok: true, type: "capture", defeated: toOwner };
  } else {
    state.army[toId] = defense - movingArmy;
    pushLog(state, `${mover.name}'s march on ${COUNTIES[toId].name} is repelled. Defenders hold with ${state.army[toId]}.`);
    return { ok: true, type: "repelled" };
  }
}

function checkElimination(state: GameState, pid: OwnerId): void {
  if (pid === "neutral") return;
  const p = getPlayer(state, pid);
  if (!p || p.eliminated) return;
  if (countyCount(state, pid) === 0) {
    p.eliminated = true;
    pushLog(state, `${p.name} has been eliminated from the campaign!`, "elim");
  }
}

// ---------- AI ----------
interface CandidateMove {
  from: string;
  to: string;
  score: number;
}

/** Picks the AI's next single move given the current board, or null if it has nothing worth doing. */
function planAiMove(state: GameState, p: RuntimePlayer): CandidateMove | null {
  const profile = DIFFICULTY_PROFILES[state.difficulty];
  const capitals = new Set(state.players.map((pl) => pl.capital));
  const candidates: CandidateMove[] = [];
  let best: CandidateMove | null = null;

  ALL_IDS.forEach((id) => {
    if (state.owner[id] !== p.id) return;
    if (state.usedSources.has(id) || state.usedDestinations.has(id)) return;
    const from = state.army[id];
    if (from < 1) return;
    COUNTIES[id].neighbors.forEach((nid) => {
      const targetOwner = state.owner[nid];
      let score: number;
      if (targetOwner === p.id) {
        const front = isFrontline(state, nid, p.id);
        // state.army[nid] is already power-scaled, so this term inherits the scale-up on its own.
        score = front ? scalePower(4) + state.army[nid] * 0.08 : scalePower(-5);
      } else {
        const defense = state.army[nid];
        if (from > defense) {
          score = scalePower(32) - (from - defense) + (targetOwner === "neutral" ? scalePower(2) : 0);
          if (targetOwner !== "neutral" && capitals.has(nid)) score += profile.capitalBonus;
        } else {
          score = scalePower(-200);
        }
      }
      if (score > -1) candidates.push({ from: id, to: nid, score });
      if (!best || score > best.score) best = { from: id, to: nid, score };
    });
  });

  if (best === null) return null;
  const bestMove: CandidateMove = best;
  if (bestMove.score <= -1) return null;

  // A less skilled AI sometimes overlooks the best move and takes a merely reasonable one instead.
  if (candidates.length > 1 && Math.random() < profile.mistakeChance) {
    return candidates[rand(0, candidates.length - 1)];
  }
  return bestMove;
}

/**
 * Chooses the AI's next move (if any) and parks it as a pending move so the UI can blink the
 * target county before it resolves. Ends the AI's phase when it has nothing left to do.
 */
export function aiPlanStep(state: GameState): void {
  if (state.gameOver) return;
  const p = currentPlayer(state);
  if (p.isHuman) return;

  const profile = DIFFICULTY_PROFILES[state.difficulty];
  // A less skilled AI can lose interest partway through its turn, even with good moves left.
  const losesInterest = state.movesUsed > 0 && Math.random() < profile.passChance;
  const move = losesInterest || state.movesUsed >= MAX_MOVES_PER_TURN ? null : planAiMove(state, p);

  if (!move) {
    if (state.movesUsed === 0) pushLog(state, `${p.name} holds its lines this turn.`);
    advanceToNextPlayer(state);
    return;
  }

  state.pendingAiMove = { from: move.from, to: move.to };
  state.blinkingCounty = move.to;
}

/** Resolves the AI's pending move (called after the blink animation finishes). */
export function aiResolveStep(state: GameState): void {
  if (state.gameOver) return;
  const p = currentPlayer(state);
  if (p.isHuman || !state.pendingAiMove) return;

  const { from, to } = state.pendingAiMove;
  executeMove(state, from, to, p.id);
  state.usedSources.add(from);
  state.usedDestinations.add(to);
  state.movesUsed += 1;
  state.pendingAiMove = null;
  state.blinkingCounty = null;

  checkGameEnd(state);
}

export function applyReinforcements(state: GameState): void {
  ALL_IDS.forEach((id) => {
    const pid = state.owner[id];
    if (pid === "neutral") return;
    const gain = scalePower(1 + Math.floor(COUNTIES[id].pop / 2));
    state.army[id] = Math.min(MAX_STACK, state.army[id] + gain);
  });
}

function showModal(state: GameState, title: string, text: string, kind: ModalInfo["kind"]): void {
  state.modal = { title, text, kind };
}

export function checkGameEnd(state: GameState): boolean {
  const active = state.players.filter(isActivePlayer);

  if (active.length <= 1) {
    state.gameOver = true;
    const winner = active[0];
    if (winner) {
      showModal(
        state,
        "Victory!",
        `Every rival province has fallen. ${winner.name} reigns over all Ireland after ${state.turn} turns.`,
        winner.isHuman ? "victory" : "danger"
      );
    } else {
      showModal(state, "Campaign Ends", `No province survives the campaign after ${state.turn} turns.`, "danger");
    }
    return true;
  }

  if (state.turn >= MAX_TURNS) {
    state.gameOver = true;
    const ranked = state.players.slice().sort((a, b) => countyCount(state, b.id) - countyCount(state, a.id));
    const leader = ranked[0];
    showModal(
      state,
      leader.isHuman ? "Victory by Dominance" : "Campaign Ends",
      `The campaign clock runs out. ${leader.name} holds the most counties (${countyCount(state, leader.id)}).`,
      leader.isHuman ? "victory" : "danger"
    );
    return true;
  }

  return false;
}

// ---------- Turn flow ----------
function beginPlayerPhase(state: GameState): void {
  state.selected = null;
  state.movesUsed = 0;
  state.usedSources = new Set();
  state.usedDestinations = new Set();
  state.blinkingCounty = null;
  state.pendingAiMove = null;
}

/** Moves the turn on to the next non-eliminated player, rolling the campaign turn over once everyone has gone. */
export function advanceToNextPlayer(state: GameState): void {
  if (state.gameOver) return;
  const n = state.players.length;
  const startIdx = state.currentPlayerIndex;
  let idx = startIdx;
  let steps = 0;
  do {
    idx = (idx + 1) % n;
    steps += 1;
  } while (state.players[idx].eliminated && steps <= n);

  if (state.players[idx].eliminated) return; // no active players left; checkGameEnd should already have caught this

  const wrapped = idx <= startIdx;
  state.currentPlayerIndex = idx;
  beginPlayerPhase(state);

  if (wrapped) {
    applyReinforcements(state);
    state.turn += 1;
    pushLog(state, `Turn ${state.turn} begins.`, "turn-marker");
  }

  checkGameEnd(state);
}

export function endTurn(state: GameState): void {
  if (state.gameOver) return;
  const p = currentPlayer(state);
  if (!p.isHuman) return;
  if (state.movesUsed === 0) {
    pushLog(state, `${p.name} holds position this turn.`);
  } else {
    pushLog(state, `${p.name} ends its turn early, ${state.movesUsed} of ${MAX_MOVES_PER_TURN} moves used.`);
  }
  advanceToNextPlayer(state);
}

export function selectCounty(state: GameState, id: string): void {
  if (state.gameOver) return;
  const p = currentPlayer(state);
  if (!p.isHuman || state.movesUsed >= MAX_MOVES_PER_TURN) return;
  const owner = state.owner[id];

  if (state.selected === id) {
    state.selected = null;
    return;
  }

  // Clicking a neighbour of the currently selected source always attempts a march,
  // whether the target is enemy, neutral, or another county of your own — a county
  // may be marched into any number of times, but once it has been a destination
  // this turn it can never become a source.
  if (state.selected && COUNTIES[state.selected].neighbors.includes(id)) {
    const from = state.selected;
    executeMove(state, from, id, p.id);
    state.usedSources.add(from);
    state.usedDestinations.add(id);
    state.movesUsed += 1;
    state.selected = null;
    if (checkGameEnd(state)) return;
    if (state.movesUsed >= MAX_MOVES_PER_TURN || !hasValidMove(state, p.id)) {
      advanceToNextPlayer(state);
    }
    return;
  }

  if (owner === p.id) {
    if (state.army[id] < 1) return;
    if (state.usedSources.has(id) || state.usedDestinations.has(id)) return;
    state.selected = id;
  }
}
