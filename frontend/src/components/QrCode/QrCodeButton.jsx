import React from "react";
import QRCode from "qrcode";               // Library to generate QR codes
import { IoQrCode } from "react-icons/io5"; // QR code icon from react-icons
import { useQrCode } from "./QrCodeContext"; // Custom context hook to share QR state
import styles from "./QrCodeButton.module.css"; // CSS module for styling

function QrCodeButton({ shortUrl, ariaLabel = "Qr code" }) {
  // Access context functions to update modal visibility and QR image
  const { setShowQrCode, setQrUrl } = useQrCode();

  // Handle button click => generate QR code and show modal
  const handleClick = async () => {
    if (!shortUrl) return;
    const dataUrl = await QRCode.toDataURL(shortUrl); // Convert shortUrl into QR code (as Data URL image)
    setQrUrl(dataUrl);                                // Save QR image into context
    setShowQrCode(true);                              // Open QR modal
  };

  return (
    <button className={styles.qrCodeButton} onClick={handleClick} title={ariaLabel} aria-label={ariaLabel}>
      {/* Small QR icon inside button */}
      <IoQrCode size={15} color="black" />
      
    </button>
  );
}

export default QrCodeButton;
