import { createInitialState, endTurn, selectCounty } from "./engine";
import type { GameState } from "./types";

export type GameAction =
  | { type: "SELECT_COUNTY"; id: string }
  | { type: "CANCEL_SELECTION" }
  | { type: "END_TURN" }
  | { type: "NEW_GAME" };

function cloneState(state: GameState): GameState {
  return {
    ...state,
    owner: { ...state.owner },
    army: { ...state.army },
    players: state.players.map((p) => ({ ...p })),
    usedSources: new Set(state.usedSources),
    usedDestinations: new Set(state.usedDestinations),
    log: [...state.log],
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SELECT_COUNTY": {
      const draft = cloneState(state);
      selectCounty(draft, action.id);
      return draft;
    }
    case "CANCEL_SELECTION": {
      const draft = cloneState(state);
      draft.selected = null;
      return draft;
    }
    case "END_TURN": {
      const draft = cloneState(state);
      endTurn(draft);
      return draft;
    }
    case "NEW_GAME":
      return createInitialState();
    default:
      return state;
  }
}

export function createInitialGameState(): GameState {
  return createInitialState();
}
