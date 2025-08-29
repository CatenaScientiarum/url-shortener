import ReactDOM from "react-dom";
import styles from "./Modal.module.css";
import CopyButton from "../CopyButton/CopyButton";
import InfoButton from "../InfoButton/InfoButton";
import RemoveButton from "../RemoveButton/RemoveButton";


export default function Modal({
  children,
  onClose,
  infoItem = null,
  index = null,
  history = null,
  setHistory = null,
}) {
  const content = children ? (
    children
  ) : infoItem ? (
    <div>
      <div className={styles.buttonRow}>
        <InfoButton onClick={onClose} />
        <RemoveButton
          index={index}
          history={history}
          setHistory={setHistory}
          onClose={onClose}
        />
      </div>

      <div className={styles.infoRow}>
        <span>Original:</span>
        <a
          href={infoItem.original}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.fullLink}
        >
          {infoItem.original}
        </a>
        <CopyButton text={infoItem.original} />
      </div>

      <div className={styles.infoRow}>
        <span>Short:</span>
        <a
          href={infoItem.short}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.fullLink}
        >
          {infoItem.short}
        </a>
        <CopyButton text={infoItem.short} />
      </div>

    </div>
  ) : (
    null
  );

  if (!content) return null;

  return ReactDOM.createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {content}
      </div>
    </div>,
    document.body
  );
}