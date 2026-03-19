export default function ConfirmOverlay({ message, confirmLabel = "Delete", cancelLabel = "Cancel", onConfirm, onCancel }) {
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="overlay-card" onClick={(e) => e.stopPropagation()}>
        <p>{message}</p>
        <div className="overlay-actions">
          <button className="overlay-btn overlay-btn--cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className="overlay-btn overlay-btn--confirm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
