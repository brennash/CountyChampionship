import { PlayerList } from "./PlayerList";
import { SelectionPanel } from "./SelectionPanel";
import { Chronicle } from "./Chronicle";
import { DifficultySelect } from "./DifficultySelect";
import type { Difficulty } from "../game/difficulty";
import type { GameState } from "../game/types";

interface Props {
  state: GameState;
  onCancel: () => void;
  onChangeDifficulty: (difficulty: Difficulty) => void;
}

export function Sidebar({ state, onCancel, onChangeDifficulty }: Props) {
  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h2>AI Difficulty</h2>
        <DifficultySelect difficulty={state.difficulty} onChange={onChangeDifficulty} />
      </div>
      <PlayerList state={state} />
      <SelectionPanel state={state} onCancel={onCancel} />
      <Chronicle state={state} />
      <div className="footer-note">
        Up to three marches per turn. A county can be marched into repeatedly, but once it's been a destination
        it can't march out as a source. Armies grow each turn; overwhelm a defender to seize their county, but
        the county you marched from is left empty.
      </div>
    </div>
  );
}
