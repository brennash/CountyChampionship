import { PlayerList } from "./PlayerList";
import { SelectionPanel } from "./SelectionPanel";
import { Chronicle } from "./Chronicle";
import type { GameState } from "../game/types";

interface Props {
  state: GameState;
  onCancel: () => void;
}

export function Sidebar({ state, onCancel }: Props) {
  return (
    <div className="sidebar">
      <PlayerList state={state} />
      <SelectionPanel state={state} onCancel={onCancel} />
      <Chronicle state={state} />
      <div className="footer-note">
        Up to three marches per turn, per province — a county can be marched into repeatedly, stacking its
        strength each time, but once it has been a destination it can never march out as a source that turn.
        Armies grow each turn on the counties you hold. Overwhelm a neighbour's defenders to seize their land
        — but the county you march from is left empty.
      </div>
    </div>
  );
}
