import type { ModalInfo } from "../game/types";

interface Props {
  modal: ModalInfo;
  onNewGame: () => void;
}

export function GameOverModal({ modal, onNewGame }: Props) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 style={{ color: modal.kind === "victory" ? "var(--gold)" : "var(--danger)" }}>{modal.title}</h2>
        <p>{modal.text}</p>
        <button className="primary" onClick={onNewGame}>
          Start New Campaign
        </button>
      </div>
    </div>
  );
}
