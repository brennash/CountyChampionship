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
        it can't march out as a source. Every stack has manpower (0–99) and morale (0–99); combat power is
        their sum, and the higher power wins outright. Winners pay in manpower roughly equal to what the
        loser had; morale climbs faster on a close win and drops harder on a crushing loss, and drifts back
        toward 50 each turn if left alone. Merging armies sums their manpower and blends their morale. If a
        capital falls, its ruler is knocked out of the campaign instantly and every county they held reverts
        to the wild.
      </div>
    </div>
  );
}
