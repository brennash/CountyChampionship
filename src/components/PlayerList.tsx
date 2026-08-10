import { COLOR_HEX } from "../data/players";
import { averageMorale, countyCount, manpowerTotal } from "../game/engine";
import type { GameState } from "../game/types";

export function PlayerList({ state }: { state: GameState }) {
  const currentPlayer = state.players[state.currentPlayerIndex];

  return (
    <div className="sidebar-section">
      <h2>Provinces</h2>
      <div>
        {state.players.map((p) => (
          <div
            key={p.id}
            className={
              "player-card" +
              (p.eliminated ? " eliminated" : "") +
              (!state.gameOver && p.id === currentPlayer.id ? " active-turn" : "")
            }
          >
            <div className="chip" style={{ background: COLOR_HEX[p.id] }} />
            <div className="player-info">
              <div className="player-name">
                <span>{p.name}</span>
                <span className="tag">{p.eliminated ? "Eliminated" : p.isHuman ? "Human" : "AI"}</span>
              </div>
              <div className="player-stats">
                {countyCount(state, p.id)} counties &middot; {manpowerTotal(state, p.id)} manpower &middot; {averageMorale(state, p.id)} avg morale
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
