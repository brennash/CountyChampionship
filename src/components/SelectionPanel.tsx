import type { ReactNode } from "react";
import { COUNTIES } from "../data/countyData";
import { MAX_MOVES_PER_TURN } from "../game/engine";
import type { GameState } from "../game/types";

interface Props {
  state: GameState;
  onCancel: () => void;
}

export function SelectionPanel({ state, onCancel }: Props) {
  let body: ReactNode;
  if (state.gameOver) {
    body = "The campaign has ended.";
  } else if (state.selected) {
    const c = COUNTIES[state.selected];
    body = (
      <>
        <b>{c.name}</b> selected — {state.army[state.selected]} troops.
        <span className="hint">Click a highlighted neighbour to march. Click again to deselect.</span>
      </>
    );
  } else {
    body = (
      <>
        Select one of your counties, then click a neighbouring county to march your army into it.
        <span className="hint">
          A county can be marched into any number of times, adding to its strength each time — but once it has
          been a destination, it can never march out as a source this turn. A dimmed county has already played
          a role and can't be selected as a new source. Your turn ends automatically after {MAX_MOVES_PER_TURN}{" "}
          moves, or click &quot;End Turn&quot; to stop sooner.
        </span>
      </>
    );
  }

  const pips = Array.from({ length: MAX_MOVES_PER_TURN }, (_, i) => (
    <span key={i} className={"move-pip" + (i < state.movesUsed ? " used" : "")} />
  ));

  return (
    <div className="sidebar-section">
      <h2>Your Move</h2>
      <div className="selection-box">
        {!state.gameOver && (
          <div className="moves-remaining">
            {MAX_MOVES_PER_TURN - state.movesUsed} of {MAX_MOVES_PER_TURN} moves left{" "}
            <span className="move-pips">{pips}</span>
          </div>
        )}
        {body}
      </div>
      <div className="action-row">
        <button disabled={!state.selected} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
