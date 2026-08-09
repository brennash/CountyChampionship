import { DIFFICULTIES, DIFFICULTY_PROFILES } from "../game/difficulty";
import type { Difficulty } from "../game/difficulty";

interface Props {
  difficulty: Difficulty;
  onChange: (difficulty: Difficulty) => void;
}

export function DifficultySelect({ difficulty, onChange }: Props) {
  return (
    <div className="difficulty-select" role="group" aria-label="AI difficulty">
      {DIFFICULTIES.map((d) => (
        <button
          key={d}
          type="button"
          className={difficulty === d ? "active" : ""}
          aria-pressed={difficulty === d}
          onClick={() => onChange(d)}
        >
          {DIFFICULTY_PROFILES[d].label}
        </button>
      ))}
    </div>
  );
}
