import { createInitialState, endTurn, pushLog, selectCounty } from "./engine";
import { DIFFICULTY_PROFILES } from "./difficulty";
import type { Difficulty } from "./difficulty";
import type { GameState } from "./types";

export type GameAction =
  | { type: "SELECT_COUNTY"; id: string }
  | { type: "CANCEL_SELECTION" }
  | { type: "END_TURN" }
  | { type: "NEW_GAME" }
  | { type: "SET_DIFFICULTY"; difficulty: Difficulty };

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
      return createInitialState(state.difficulty);
    case "SET_DIFFICULTY": {
      if (action.difficulty === state.difficulty) return state;
      const draft = cloneState(state);
      draft.difficulty = action.difficulty;
      pushLog(draft, `AI difficulty set to ${DIFFICULTY_PROFILES[action.difficulty].label}.`);
      return draft;
    }
    default:
      return state;
  }
}

export function createInitialGameState(): GameState {
  return createInitialState();
}
