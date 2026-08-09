interface Props {
  turn: number;
  gameOver: boolean;
  onEndTurn: () => void;
  onNewGame: () => void;
}

export function TitleBar({ turn, gameOver, onEndTurn, onNewGame }: Props) {
  return (
    <div className="titlebar">
      <div className="brand">
        <h1>All-Ireland Inter-County Battle</h1>
        <span className="subtitle">A campaign across the 32 counties</span>
      </div>
      <div className="turn-badge">
        Turn <b>{turn}</b>
      </div>
      <div className="toolbar">
        <button className="primary" onClick={onEndTurn} disabled={gameOver}>
          End Turn
        </button>
        <button onClick={onNewGame}>New Game</button>
      </div>
    </div>
  );
}
