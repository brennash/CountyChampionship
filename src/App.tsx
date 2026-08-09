import { useReducer } from "react";
import { createInitialGameState, gameReducer } from "./game/reducer";
import { TitleBar } from "./components/TitleBar";
import { MapView } from "./components/MapView";
import { Sidebar } from "./components/Sidebar";
import { GameOverModal } from "./components/GameOverModal";

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialGameState);

  return (
    <>
      <TitleBar
        turn={state.turn}
        gameOver={state.gameOver}
        onEndTurn={() => dispatch({ type: "END_TURN" })}
        onNewGame={() => dispatch({ type: "NEW_GAME" })}
      />
      <div className="layout">
        <div className="map-wrap">
          <div className="map-frame">
            <MapView state={state} onSelect={(id) => dispatch({ type: "SELECT_COUNTY", id })} />
          </div>
        </div>
        <Sidebar
          state={state}
          onCancel={() => dispatch({ type: "CANCEL_SELECTION" })}
          onChangeDifficulty={(difficulty) => dispatch({ type: "SET_DIFFICULTY", difficulty })}
        />
      </div>
      {state.modal && <GameOverModal modal={state.modal} onNewGame={() => dispatch({ type: "NEW_GAME" })} />}
    </>
  );
}
