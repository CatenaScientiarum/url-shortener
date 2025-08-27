import styles from "./RemoveButton.module.css";

export default function RemoveButton({ index, history, setHistory, onClose }) {
  const handleRemove = () => {
    setHistory(prev => prev.filter((_, i) => i !== index));
    if (onClose) onClose();
  };

  return (
    <button
      className={styles.removeButton}
      onClick={handleRemove}
      title="Remove"
    >
    </button>
  );
}
