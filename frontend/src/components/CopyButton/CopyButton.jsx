import { useState, useRef } from "react";
import styles from "./CopyButton.module.css";

async function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  const handleCopy = async () => {
    try {
      await copyToClipboard(text);
      setCopied(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
      alert("Copy failed");
    }
  };

  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : "Copy"}
      className={`${styles.copyButton} ${copied ? styles.copied : ""}`}
      onClick={handleCopy}
      title="Copy short URL"
    >
      <span className={styles.visuallyHidden}>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}
