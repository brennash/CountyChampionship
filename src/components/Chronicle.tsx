import type { GameState } from "../game/types";

export function Chronicle({ state }: { state: GameState }) {
  const entries = state.log.slice().reverse();
  return (
    <div className="log-section">
      <h2
        style={{
          fontSize: "0.68rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--ink-faint)",
          margin: "0 0 10px 0",
          fontWeight: 700,
        }}
      >
        Chronicle
      </h2>
      <div className="log-list">
        {entries.map((entry, i) => (
          <div key={i} className={"log-entry " + entry.cls}>
            {entry.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
