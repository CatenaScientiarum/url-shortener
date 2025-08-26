import { useState } from "react";
import styles from "./UrlHistory.module.css";
import Modal from "../ModalWindow/Modal";
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
            {history.map((item, i) => (
              <li key={item.short + i} className={styles.item}>
                {/* Left Buttons Info */}
                <InfoButton onClick={() => setInfoIndex(i)} />

                {/* Link in the middle */}
                <a
                  className={styles.link}
                  href={item.short}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.short}
                </a>

                {/* Right Buttons in the end */}
                <div className={styles.rightBtns}>
                  <CopyButton text={item.short} />
                  <RemoveButton
                    index={i}
                    history={history}
                    setHistory={setHistory}
                  />
                </div>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <button className={styles.clearBtn} onClick={clearAll}>
              Clear history
            </button>
          </div>

          {/* Modal Window */}
          {infoIndex !== null && (
            <Modal onClose={() => setInfoIndex(null)}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <InfoButton onClick={() => setInfoIndex(null)} />
              <RemoveButton
                index={infoIndex}
                history={history}
                setHistory={setHistory}
                onClose={() => setInfoIndex(null)}
              />
              </div>
              <div className={styles.infoRow}>
                <span>Original:</span>
                <a
                  href={history[infoIndex].original}
                  target="_blank"
                  rel="noreferrer"
                >
                  {history[infoIndex].original}
                </a>
                <CopyButton text={history[infoIndex].original} />
              </div>
              <div className={styles.infoRow}>
                <span>Short:</span>
                <a
                  href={history[infoIndex].short}
                  target="_blank"
                  rel="noreferrer"
                >
                  {history[infoIndex].short}
                </a>
                <CopyButton text={history[infoIndex].short} />
              </div>
            </Modal>
          )}
        </>
      )}
    </div>
  );
}
