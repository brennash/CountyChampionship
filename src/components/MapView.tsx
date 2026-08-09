import { ALL_IDS, COUNTIES } from "../data/countyData";
import { COUNTY_SHAPES } from "../data/shapes";
import { COLOR_HEX } from "../data/players";
import { MAX_MOVES_PER_TURN } from "../game/engine";
import type { GameState } from "../game/types";

interface Props {
  state: GameState;
  onSelect: (id: string) => void;
}

export function MapView({ state, onSelect }: Props) {
  return (
    <svg id="map" viewBox="100 60 1270 1670" xmlns="http://www.w3.org/2000/svg">
      <g>
        {ALL_IDS.map((id) => {
          const c = COUNTIES[id];
          const shape = COUNTY_SHAPES[id];
          const ownerId = state.owner[id];

          const classes = ["county"];
          if (state.selected === id) classes.push("selected");
          if (
            state.selected &&
            COUNTIES[state.selected].neighbors.includes(id) &&
            state.movesUsed < MAX_MOVES_PER_TURN
          ) {
            classes.push("targetable");
          }
          if (ownerId === "human" && (state.usedSources.has(id) || state.usedDestinations.has(id))) {
            classes.push("locked");
          }

          return (
            <g key={id} className={classes.join(" ")} onClick={() => onSelect(id)}>
              <path d={shape.d} fill={COLOR_HEX[ownerId]} />
              <text className="label" x={c.x} y={c.y - 9}>
                {c.id}
              </text>
              <text className="army" x={c.x} y={c.y + 27}>
                {state.army[id]}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
