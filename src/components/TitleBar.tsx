interface Props {
  turn: number;
  gameOver: boolean;
  currentPlayerName: string;
  isHumanTurn: boolean;
  onEndTurn: () => void;
  onNewGame: () => void;
}

export function TitleBar({ turn, gameOver, currentPlayerName, isHumanTurn, onEndTurn, onNewGame }: Props) {
  return (
    <div className="titlebar">
      <div className="brand">
        <h1>All-Ireland Inter-County Battle</h1>
        <span className="subtitle">A campaign across the 32 counties</span>
      </div>
      <div className="turn-badge">
        Turn <b>{turn}</b>
        {!gameOver && <span>&middot; {currentPlayerName} {isHumanTurn ? "to move" : "marching…"}</span>}
      </div>
      <div className="toolbar">
        <button className="primary" onClick={onEndTurn} disabled={gameOver || !isHumanTurn}>
          End Turn
        </button>
        <button onClick={onNewGame}>New Game</button>
      </div>
    </div>
  );
}
