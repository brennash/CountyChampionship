import { ALL_IDS, COUNTIES } from "../data/countyData";
import { PLAYERS } from "../data/players";
import type { OwnerId } from "../data/players";
import { DIFFICULTY_PROFILES } from "./difficulty";
import type { Difficulty } from "./difficulty";
import type { GameState, LogEntry, ModalInfo, MoveResult, RuntimePlayer } from "./types";

export const MAX_STACK = 30;
export const MAX_TURNS = 220;
export const START_ARMY = 10;
export const MAX_MOVES_PER_TURN = 3;

function rand(a: number, b: number): number {
  return a + Math.floor(Math.random() * (b - a + 1));
}

export function createInitialState(difficulty: Difficulty = "hard"): GameState {
  const owner: Record<string, OwnerId> = {};
  const army: Record<string, number> = {};
  ALL_IDS.forEach((id) => {
    owner[id] = "neutral";
    army[id] = COUNTIES[id].pop + rand(1, 3);
  });
  PLAYERS.forEach((p) => {
    owner[p.capital] = p.id;
    army[p.capital] = START_ARMY;
  });

  const state: GameState = {
    turn: 1,
    difficulty,
    owner,
    army,
    players: PLAYERS.map((p): RuntimePlayer => ({ ...p, eliminated: false })),
    selected: null,
    movesUsed: 0,
    usedSources: new Set(),
    usedDestinations: new Set(),
    log: [],
    gameOver: false,
    modal: null,
  };
  pushLog(state, "Turn 1 begins. Four provinces rise to claim the island.", "turn-marker");
  return state;
}

export function pushLog(state: GameState, msg: string, cls?: string): void {
  state.log.push({ msg, cls: cls || "log-entry" } as LogEntry);
  if (state.log.length > 200) state.log.shift();
}

export function getPlayer(state: GameState, id: OwnerId): RuntimePlayer | undefined {
  return state.players.find((p) => p.id === id);
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

// ---------- Combat ----------
export function executeMove(state: GameState, fromId: string, toId: string, pid: OwnerId): MoveResult {
  const movingArmy = state.army[fromId];
  if (movingArmy < 1) return { ok: false };
  const toOwner = state.owner[toId];
  state.army[fromId] = 0;
  const mover = getPlayer(state, pid)!;

  if (toOwner === pid) {
    state.army[toId] = Math.min(MAX_STACK, state.army[toId] + movingArmy);
    pushLog(state, `${mover.name} reinforces ${COUNTIES[toId].name} with ${movingArmy} (now ${state.army[toId]}).`);
    return { ok: true, type: "reinforce" };
  }

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

export function aiTakeTurn(state: GameState, p: RuntimePlayer): void {
  const profile = DIFFICULTY_PROFILES[state.difficulty];
  const capitals = new Set(state.players.map((pl) => pl.capital));
  const usedSources = new Set<string>();
  const usedDestinations = new Set<string>();
  let movesMade = 0;

  for (let move = 0; move < MAX_MOVES_PER_TURN; move++) {
    // A less skilled AI can lose interest partway through its turn, even with good moves left.
    if (move > 0 && Math.random() < profile.passChance) break;

    const candidates: CandidateMove[] = [];
    let best: CandidateMove | null = null;

    ALL_IDS.forEach((id) => {
      if (state.owner[id] !== p.id) return;
      if (usedSources.has(id) || usedDestinations.has(id)) return;
      const from = state.army[id];
      if (from < 1) return;
      COUNTIES[id].neighbors.forEach((nid) => {
        const targetOwner = state.owner[nid];
        let score: number;
        if (targetOwner === p.id) {
          const front = isFrontline(state, nid, p.id);
          score = front ? 4 + state.army[nid] * 0.08 : -5;
        } else {
          const defense = state.army[nid];
          if (from > defense) {
            score = 32 - (from - defense) + (targetOwner === "neutral" ? 2 : 0);
            if (targetOwner !== "neutral" && capitals.has(nid)) score += profile.capitalBonus;
          } else {
            score = -200;
          }
        }
        if (score > -1) candidates.push({ from: id, to: nid, score });
        if (!best || score > best.score) best = { from: id, to: nid, score };
      });
    });

    if (best === null) break;
    const bestMove: CandidateMove = best;
    if (bestMove.score <= -1) break;

    // A less skilled AI sometimes overlooks the best move and takes a merely reasonable one instead.
    const chosen =
      candidates.length > 1 && Math.random() < profile.mistakeChance
        ? candidates[rand(0, candidates.length - 1)]
        : bestMove;

    executeMove(state, chosen.from, chosen.to, p.id);
    usedSources.add(chosen.from);
    usedDestinations.add(chosen.to);
    movesMade++;
  }

  if (movesMade === 0) {
    pushLog(state, `${p.name} holds its lines this turn.`);
  }
}

export function applyReinforcements(state: GameState): void {
  ALL_IDS.forEach((id) => {
    const pid = state.owner[id];
    if (pid === "neutral") return;
    const gain = 1 + Math.floor(COUNTIES[id].pop / 2);
    state.army[id] = Math.min(MAX_STACK, state.army[id] + gain);
  });
}

function showModal(state: GameState, title: string, text: string, kind: ModalInfo["kind"]): void {
  state.modal = { title, text, kind };
}

export function checkGameEnd(state: GameState): boolean {
  const human = getPlayer(state, "human")!;
  if (human.eliminated) {
    state.gameOver = true;
    showModal(state, "Defeat", `Leinster has fallen. The island passes to other hands after ${state.turn} turns.`, "danger");
    return true;
  }
  const active = state.players.filter(isActivePlayer);
  if (active.length === 1 && active[0].isHuman) {
    state.gameOver = true;
    showModal(state, "Victory!", `Every rival province has fallen. Leinster reigns over all Ireland after ${state.turn} turns.`, "victory");
    return true;
  }
  if (countyCount(state, "human") === 32) {
    state.gameOver = true;
    showModal(state, "Victory!", `All 32 counties fly the Leinster banner. The island is united after ${state.turn} turns.`, "victory");
    return true;
  }
  if (state.turn >= MAX_TURNS) {
    state.gameOver = true;
    const ranked = state.players.slice().sort((a, b) => countyCount(state, b.id) - countyCount(state, a.id));
    const leader = ranked[0];
    if (leader.isHuman) {
      showModal(
        state,
        "Victory by Dominance",
        `The campaign clock runs out. Leinster holds the most counties (${countyCount(state, "human")}) and claims the age.`,
        "victory"
      );
    } else {
      showModal(
        state,
        "Campaign Ends",
        `The campaign clock runs out. ${leader.name} holds the most counties (${countyCount(state, leader.id)}). Leinster is not the strongest power.`,
        "danger"
      );
    }
    return true;
  }
  return false;
}

// ---------- Turn flow ----------
export function advanceTurn(state: GameState): void {
  state.selected = null;

  state.players.forEach((p) => {
    if (!p.isHuman && isActivePlayer(p)) aiTakeTurn(state, p);
  });
  if (checkGameEnd(state)) return;

  applyReinforcements(state);
  state.turn += 1;
  state.movesUsed = 0;
  state.usedSources = new Set();
  state.usedDestinations = new Set();
  pushLog(state, `Turn ${state.turn} begins.`, "turn-marker");

  checkGameEnd(state);
}

export function endTurn(state: GameState): void {
  if (state.gameOver || state.movesUsed >= MAX_MOVES_PER_TURN) return;
  if (state.movesUsed === 0) {
    pushLog(state, `Leinster holds position this turn.`);
  } else {
    pushLog(state, `Leinster ends its turn early, ${state.movesUsed} of ${MAX_MOVES_PER_TURN} moves used.`);
  }
  advanceTurn(state);
}

export function selectCounty(state: GameState, id: string): void {
  if (state.gameOver || state.movesUsed >= MAX_MOVES_PER_TURN) return;
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
    executeMove(state, from, id, "human");
    state.usedSources.add(from);
    state.usedDestinations.add(id);
    state.movesUsed += 1;
    state.selected = null;
    if (checkGameEnd(state)) return;
    if (state.movesUsed >= MAX_MOVES_PER_TURN) {
      advanceTurn(state);
    }
    return;
  }

  if (owner === "human") {
    if (state.army[id] < 1) return;
    if (state.usedSources.has(id) || state.usedDestinations.has(id)) return;
    state.selected = id;
  }
}
