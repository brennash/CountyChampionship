import { useEffect, useReducer, useState } from "react";
import { createInitialGameState, gameReducer } from "./game/reducer";
import { TitleBar } from "./components/TitleBar";
import { MapView } from "./components/MapView";
import { Sidebar } from "./components/Sidebar";
import { GameOverModal } from "./components/GameOverModal";
import { SetupScreen } from "./components/SetupScreen";

const AI_BLINK_MS = 2000;
const AI_THINK_MS = 500;

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialGameState);
  const [started, setStarted] = useState(false);

  const currentPlayer = state.players[state.currentPlayerIndex];

  useEffect(() => {
    if (!started || state.gameOver || currentPlayer.isHuman) return;
    if (state.pendingAiMove) {
      const t = setTimeout(() => dispatch({ type: "AI_RESOLVE_MOVE" }), AI_BLINK_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => dispatch({ type: "AI_PLAN_MOVE" }), AI_THINK_MS);
    return () => clearTimeout(t);
  }, [state, started, currentPlayer]);

  if (!started) {
    return (
      <SetupScreen
        onStart={(roles, difficulty) => {
          dispatch({ type: "NEW_GAME", roles, difficulty });
          setStarted(true);
        }}
      />
    );
  }

  return (
    <>
      <TitleBar
        turn={state.turn}
        gameOver={state.gameOver}
        currentPlayerName={currentPlayer.name}
        isHumanTurn={currentPlayer.isHuman}
        onEndTurn={() => dispatch({ type: "END_TURN" })}
        onNewGame={() => setStarted(false)}
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
      {state.modal && <GameOverModal modal={state.modal} onNewGame={() => setStarted(false)} />}
    </>
  );
}
