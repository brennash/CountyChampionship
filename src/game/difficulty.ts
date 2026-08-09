export type Difficulty = "easy" | "medium" | "hard";

export interface DifficultyProfile {
  label: string;
  /** Chance, per move, that the AI ignores the best move and picks a random reasonable one instead. */
  mistakeChance: number;
  /** Chance, after its first move of the turn, that the AI stops taking further moves early. */
  passChance: number;
  /** Extra score weight given to attacking an enemy capital (strategic prioritisation). */
  capitalBonus: number;
}

export const DIFFICULTY_PROFILES: Record<Difficulty, DifficultyProfile> = {
  easy: { label: "Easy", mistakeChance: 0.6, passChance: 0.35, capitalBonus: 0 },
  medium: { label: "Medium", mistakeChance: 0.25, passChance: 0.1, capitalBonus: 6 },
  hard: { label: "Hard", mistakeChance: 0, passChance: 0, capitalBonus: 12 },
};

export const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];
