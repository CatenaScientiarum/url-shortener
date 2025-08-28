import { createContext, useContext, useState } from "react";

// Create a React context to share QR code state across the app
const QrCodeContext = createContext();

// Context provider component
export const QrCodeProvider = ({ children }) => {
  // State to control whether the QR code modal is visible
  const [showQrCode, setShowQrCode] = useState(false);

  // State to store the QR code image (as a Data URL)
  const [qrUrl, setQrUrl] = useState("");

  // Provide state and setters to all child components
  return (
    <QrCodeContext.Provider
      value={{ showQrCode, setShowQrCode, qrUrl, setQrUrl }}
    >
      {children}
    </QrCodeContext.Provider>
  );
};

// Custom hook to easily access the QR code context
export const useQrCode = () => useContext(QrCodeContext);

//Why we need this:
// State sharing across components:
// The QR code modal (QrCodeWindow) and the button (QrCodeButton) are separate components.
// Without context, we would need to lift state up to a common parent and pass it down as props.

// Simpler and cleaner code:
// Using a context allows any component in your app tree wrapped by `QrCodeProvider` to read or update the QR code state without prop drilling.

// Centralized control:
// showQrCode and qrUrl live in one place, making it easy to control when the modal opens and what image it displays.