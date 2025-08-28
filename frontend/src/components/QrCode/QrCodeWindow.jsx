import React, { useState, useEffect } from "react";
import { useQrCode } from "./QrCodeContext"; // Custom context to manage QR code state
import styles from "./QrCodeWindow.module.css"; // CSS module for styling
import { MdOutlineDoneOutline } from "react-icons/md"; // "Done" checkmark icon for copied popup

function QrCodeWindow({ description }) {
  // Get state and setters from context
  const { showQrCode, setShowQrCode, qrUrl } = useQrCode();

  // Local state to track whether the QR code was copied
  const [copied, setCopied] = useState(false);

  // For the smooth animation
  const [visible, setVisible] = useState(false);

  // If modal is not open, don't render anything
  useEffect(() => {
    if (showQrCode) {
      setVisible(true);
    }
  }, [showQrCode]);

  // Closing with a delay so that the animation has time
  const handleClose = () => {
    setVisible(false); // We launch the animation of the disappearance
    setTimeout(() => setShowQrCode(false), 300); // We hide completely after 300ms
  };

  if (!showQrCode && !visible) return null; // It would not render if it closed

  // Handle clicking on the QR code -> copy the image itself to clipboard
  const handleCopy = async () => {
    try {
      const response = await fetch(qrUrl); // Fetch the QR code image
      const blob = await response.blob(); // Convert response into Blob
      const item = new ClipboardItem({ [blob.type]: blob });

      await navigator.clipboard.write([item]); // Write image Blob into clipboard

      setCopied(true); // Show "Copied!" popup
      setTimeout(() => setCopied(false), 2000); // Hide popup after 2 seconds
    } catch (err) {
      console.error("Failed to copy image:", err);
    }
  };

  return (
    <div
      className={`${styles.overlay} ${visible ? styles.show : ""}`}
      onClick={handleClose}
    >
      {/* e.stopPropagation() prevents the click inside the modal from triggering the overlay’s onClick. */}
      <div className={styles.qrModal} onClick={(e) => e.stopPropagation()}>
        {/* Copied popup with checkmark icon */}
        {copied && (
          <div className={styles.copiedPopup}>
            <MdOutlineDoneOutline /> Copied!
          </div>
        )}

        {/* QR code wrapper with shine effect and click-to-copy */}
        <div className={styles.qrWrapper} onClick={handleCopy}>
          <img className={styles.qrImage} src={qrUrl} alt="QR Code" />
          <span className={styles.shine} />
        </div>

        {/* QR code description text */}
        <p className={styles.qrDescription}>{description}</p>

        {/* Close button for modal */}
        <button className={styles.qrButton} onClick={handleClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default QrCodeWindow;
