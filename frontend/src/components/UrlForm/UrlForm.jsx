import styles from "./UrlForm.module.css";

export default function UrlForm({ url, setUrl, onSubmit }) {
  return (
    <div className={styles["transparent-box"]}>
      <form onSubmit={onSubmit}>
        <input
          type="url"
          value={url}
          placeholder="Please enter your URL here"
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <button type="submit" title="Create short link">
          Forge</button>
      </form>
    </div>
  );
}