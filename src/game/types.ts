import type { OwnerId, PlayerId } from "../data/players";
import type { Difficulty } from "./difficulty";

export interface RuntimePlayer {
  id: PlayerId;
  name: string;
  isHuman: boolean;
  capital: string;
  eliminated: boolean;
}

export interface LogEntry {
  msg: string;
  cls: string;
}

export interface ModalInfo {
  title: string;
  text: string;
  kind: "victory" | "danger";
}

export interface PendingAiMove {
  from: string;
  to: string;
}

export interface GameState {
  turn: number;
  difficulty: Difficulty;
  owner: Record<string, OwnerId>;
  manpower: Record<string, number>;
  morale: Record<string, number>;
  players: RuntimePlayer[];
  /** Index into `players` of whoever's phase it currently is — human or AI. */
  currentPlayerIndex: number;
  selected: string | null;
  movesUsed: number;
  usedSources: Set<string>;
  usedDestinations: Set<string>;
  /** County the AI is currently telegraphing as its next move's target, for the blink animation. */
  blinkingCounty: string | null;
  /** AI move chosen but not yet resolved — held back until the blink animation finishes. */
  pendingAiMove: PendingAiMove | null;
  log: LogEntry[];
  gameOver: boolean;
  modal: ModalInfo | null;
}

export type MoveResult =
  | { ok: false }
  | { ok: true; type: "reinforce" }
  | { ok: true; type: "capture"; defeated: OwnerId }
  | { ok: true; type: "repelled" };
