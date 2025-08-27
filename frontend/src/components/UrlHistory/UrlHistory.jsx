import { useState } from "react";
import styles from "./UrlHistory.module.css";
import Modal from "../Modal/Modal";
import CopyButton from "../CopyButton/CopyButton";
import InfoButton from "../InfoButton/InfoButton";
import RemoveButton from "../RemoveButton/RemoveButton";

export default function UrlHistory({ history = [], setHistory }) {
  const [infoIndex, setInfoIndex] = useState(null);

  const clearAll = () => {
    setHistory([]);
    localStorage.removeItem("urlHistory");
  };

  return (
    <div className={styles["transparent-box"]}>
      {history.length === 0 ? (
        <p className={styles.empty}>No links yet</p>
      ) : (
        <>
          <ul className={styles.list}>
            {history.map((item, i) => {
              const shortUrl = item.short;

              return (
                <li key={shortUrl + i} className={styles.item}>
                  <InfoButton onClick={() => setInfoIndex(i)} />
                  <a
                    className={styles.link}
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open short URL"
                  >
                    {shortUrl}
                  </a>
                  <div className={styles.RightButtons}>
                    <CopyButton text={shortUrl} />
                    <RemoveButton
                      index={i}
                      history={history}
                      setHistory={setHistory}
                    />
                  </div>
                </li>
              );
            })}
          </ul>

          <div className={styles.actions}>
            <button className={styles.ClearButton} title="Clear Url history" onClick={clearAll}>
              Clear history
            </button>
          </div>

          {infoIndex !== null && (
            <Modal
              onClose={() => setInfoIndex(null)}
              infoItem={history[infoIndex]}
              index={infoIndex}
              history={history}
              setHistory={setHistory}
            />
          )}
        </>
      )}
    </div>
  );
}