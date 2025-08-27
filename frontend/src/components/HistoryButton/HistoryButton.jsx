import styles from "../HistoryButton/HistoryButton.module.css";

export default function HistoryButton({ onClick, title = "History", ariaLabel = "Open history" }) {
  return (
    <button
      type="button"
      className={styles.historyButton}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
    />
  );
}