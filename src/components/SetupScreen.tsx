import { useState } from "react";
import { COLOR_HEX, PLAYERS } from "../data/players";
import type { PlayerId } from "../data/players";
import { DifficultySelect } from "./DifficultySelect";
import type { Difficulty } from "../game/difficulty";

interface Props {
  onStart: (roles: Record<PlayerId, boolean>, difficulty: Difficulty) => void;
}

export function SetupScreen({ onStart }: Props) {
  const [roles, setRoles] = useState<Record<PlayerId, boolean>>(() => {
    const r = {} as Record<PlayerId, boolean>;
    PLAYERS.forEach((p) => {
      r[p.id] = p.isHuman;
    });
    return r;
  });
  const [difficulty, setDifficulty] = useState<Difficulty>("hard");

  return (
    <div className="setup-screen">
      <div className="setup-card">
        <h1>All-Ireland Inter-County Battle</h1>
        <p className="setup-subtitle">Choose who controls each province before the campaign begins.</p>

        <div className="setup-players">
          {PLAYERS.map((p) => (
            <div key={p.id} className="setup-row">
              <div className="chip" style={{ background: COLOR_HEX[p.id] }} />
              <div className="setup-name">{p.name}</div>
              <div className="role-toggle" role="group" aria-label={`${p.name} control`}>
                <button
                  type="button"
                  className={roles[p.id] ? "active" : ""}
                  aria-pressed={roles[p.id]}
                  onClick={() => setRoles((r) => ({ ...r, [p.id]: true }))}
                >
                  Human
                </button>
                <button
                  type="button"
                  className={!roles[p.id] ? "active" : ""}
                  aria-pressed={!roles[p.id]}
                  onClick={() => setRoles((r) => ({ ...r, [p.id]: false }))}
                >
                  AI
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="setup-difficulty">
          <h2>AI Difficulty</h2>
          <DifficultySelect difficulty={difficulty} onChange={setDifficulty} />
        </div>

        <button className="primary setup-start" onClick={() => onStart(roles, difficulty)}>
          Begin Campaign
        </button>
      </div>
    </div>
  );
}
