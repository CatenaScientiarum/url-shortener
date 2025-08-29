import styles from "./ShortUrlDisplay.module.css";
import CopyButton from "../CopyButton/CopyButton";
import HistoryButton from "../HistoryButton/HistoryButton";
import QrCodeButton from "../QrCode/QrCodeButton";
import QrCodeWindow from "../QrCode/QrCodeWindow";

export default function ShortUrlDisplay({ shortUrl, onOpenHistory }) {
  return (
    <div className={styles.container}>
      <p className={styles.shortUrl}>
        <span className={styles.label}>Short Url:</span>
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

      <div className={styles.actionRow}>
        <CopyButton text={shortUrl} />
        <QrCodeButton shortUrl={shortUrl} />
        <HistoryButton onClick={onOpenHistory} />
      </div>

      <QrCodeWindow
        description={
          <>
            Scan this QR code to open a site <br />
            or copy it by clicking on it
          </>
        }
      />
    </div>
  );
}
