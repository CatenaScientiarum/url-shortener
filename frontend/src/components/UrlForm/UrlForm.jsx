import styles from "./UrlForm.module.css";
import InfoButton from "../InfoButton/InfoButton";

export default function UrlForm({
  url,
  setUrl,
  onSubmit,
  history,
  onOpenHistory,
}) {
  return (
    <div className={styles["transparent-box"]}>
      <form onSubmit={onSubmit} className={styles.formInnerStyle}>
        <input
          type="url"
          value={url}
          placeholder="Please enter your URL here"
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <div style={{ display: "flex", width: "100%", gap: "10px" }}>
          <button type="submit" title="Create short link">
            Forge
          </button>
          {history.length > 0 && (
            <InfoButton
              type="button"
              onClick={onOpenHistory}
              ariaLabel="Open history"
              style={{ backgroundSize: "40%" }}
            />
          )}
        </div>
      </form>
    </div>
  );
}
