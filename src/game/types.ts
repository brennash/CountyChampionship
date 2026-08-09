import type { OwnerId, PlayerId } from "../data/players";

export interface RuntimePlayer {
  id: PlayerId;
  name: string;
  tag: string;
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

export interface GameState {
  turn: number;
  owner: Record<string, OwnerId>;
  army: Record<string, number>;
  players: RuntimePlayer[];
  selected: string | null;
  movesUsed: number;
  usedSources: Set<string>;
  usedDestinations: Set<string>;
  log: LogEntry[];
  gameOver: boolean;
  modal: ModalInfo | null;
}

export type MoveResult =
  | { ok: false }
  | { ok: true; type: "reinforce" }
  | { ok: true; type: "capture"; defeated: OwnerId }
  | { ok: true; type: "repelled" };
