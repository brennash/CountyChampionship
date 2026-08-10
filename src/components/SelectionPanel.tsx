import type { ReactNode } from "react";
import { COUNTIES } from "../data/countyData";
import { MAX_MOVES_PER_TURN } from "../game/engine";
import type { GameState } from "../game/types";

interface Props {
  state: GameState;
  onCancel: () => void;
}

export function SelectionPanel({ state, onCancel }: Props) {
  const cp = state.players[state.currentPlayerIndex];
  let body: ReactNode;

  if (state.gameOver) {
    body = "The campaign has ended.";
  } else if (!cp.isHuman) {
    body = (
      <>
        {cp.name} is marching.
        <span className="hint">Watch the map — each move is highlighted before it lands.</span>
      </>
    );
  } else if (state.selected) {
    const c = COUNTIES[state.selected];
    const manpower = state.manpower[state.selected];
    const morale = state.morale[state.selected];
    body = (
      <>
        <b>{c.name}</b> selected — {manpower} manpower, {morale} morale (power {manpower + morale}).
        <span className="hint">Click a highlighted neighbour to march. Click again to deselect.</span>
      </>
    );
  } else {
    body = (
      <>
        Select one of your counties, then click a neighbouring county to march your army into it.
        <span className="hint">A dimmed county has already played a role this turn and can't be a new source.</span>
      </>
    );
  }

  const pips = Array.from({ length: MAX_MOVES_PER_TURN }, (_, i) => (
    <span key={i} className={"move-pip" + (i < state.movesUsed ? " used" : "")} />
  ));

  return (
    <div className="sidebar-section">
      <h2>{state.gameOver ? "Campaign Over" : `${cp.name}'s Move`}</h2>
      <div className="selection-box">
        {!state.gameOver && (
          <div className="moves-remaining">
            {MAX_MOVES_PER_TURN - state.movesUsed} of {MAX_MOVES_PER_TURN} moves left{" "}
            <span className="move-pips">{pips}</span>
          </div>
        )}
        {body}
      </div>
      {cp.isHuman && state.selected && (
        <div className="action-row">
          <button onClick={onCancel}>Cancel</button>
        </div>
      )}
    </div>
  );
}
