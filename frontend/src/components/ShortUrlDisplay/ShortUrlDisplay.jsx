import styles from "./ShortUrlDisplay.module.css";
import CopyButton from "../CopyButton/CopyButton";


export default function ShortUrlDisplay({ shortUrl }) {
  return (
    <div className={styles.container}>
      <p className={styles.shortUrl}>
      <span className={styles.label}>Short Url:</span>{" "}
      <a
        href={shortUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
        title="Open short URL"
      >
        {shortUrl}
      </a>
    </p>

      <CopyButton text={shortUrl} />
    </div>
  );
}
