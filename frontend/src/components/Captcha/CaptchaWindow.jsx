import React, { useEffect, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import styles from "./CaptchaWindow.module.css";

export default function CaptchaWindow({
  siteKey,
  onVerify,
  onCancel,
  visible,
}) {
  const captchaRef = useRef(null);
  useEffect(() => {
    if (visible) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    const t = setTimeout(() => {
      if (
        captchaRef.current &&
        typeof captchaRef.current.execute === "function"
      ) {
        captchaRef.current.execute();
      }
    }, 250);
    return () => clearTimeout(t);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modalWrapper}>
        <div className={styles.modal}>
          <div className={styles.attention}>
            <h3 className={styles.title}>Be calm</h3>
            <p className={styles.subtitle}>Hmm... very suspicious</p>
            <p className={styles.subtitle}>
              Next time we might need verify you're not a robot{" "}
            </p>
            <div className={styles.shine}></div>
          </div>

          <div className={styles.gifWrapper}>
              <img src="/eye.gif" alt="watching eye" className={styles.eyeGif} />
          </div>

          <div className={styles.captchaWrapper}>
            <ReCAPTCHA
              sitekey={siteKey}
              size="invisible"
              ref={captchaRef}
              onChange={(token) => {
                if (token) onVerify(token);
              }}
            />
          </div>

          <div className={styles.controls}>
            <button className={styles.cancel} onClick={onCancel} type="button">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
