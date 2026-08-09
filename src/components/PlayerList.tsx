import { COLOR_HEX } from "../data/players";
import { armyTotal, countyCount } from "../game/engine";
import type { GameState } from "../game/types";

export function PlayerList({ state }: { state: GameState }) {
  return (
    <div className="sidebar-section">
      <h2>Provinces</h2>
      <div>
        {state.players.map((p) => (
          <div
            key={p.id}
            className={"player-card" + (p.eliminated ? " eliminated" : "") + (p.isHuman ? " you" : "")}
          >
            <div className="chip" style={{ background: COLOR_HEX[p.id] }} />
            <div className="player-info">
              <div className="player-name">
                <span>{p.name}</span>
                <span className="tag">{p.eliminated ? "Eliminated" : p.tag}</span>
              </div>
              <div className="player-stats">
                {countyCount(state, p.id)} counties &middot; {armyTotal(state, p.id)} troops
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
