import styles from "./InfoButton.module.css";

export default function InfoButton({ onClick }) {
  return (
    <button
      type="button"
      className={styles.infoButton}
      onClick={onClick}
      title="Info"
    ></button>
  );
}
