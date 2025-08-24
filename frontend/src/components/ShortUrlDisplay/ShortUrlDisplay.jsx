import styles from "./ShortUrlDisplay.module.css";

export default function ShortUrlDisplay({ shortUrl }) {
  return (
    <p className={styles.shortUrl}>
      Short Url:{" "}
      <a href={shortUrl} target="_blank" rel="noopener noreferrer">
        {shortUrl}
      </a>
    </p>
  );
}
