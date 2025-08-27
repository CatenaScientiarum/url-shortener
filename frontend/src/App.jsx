import { useState, useEffect, useRef } from "react";
// import HCaptcha from "@hcaptcha/react-hcaptcha";

import "./App.css";
import Title from "./components/Title/Title";
import Description from "./components/Description/Description";
import UrlForm from "./components/UrlForm/UrlForm";
import UrlHistory from "./components/UrlHistory/UrlHistory";
import ShortUrlDisplay from "./components/ShortUrlDisplay/ShortUrlDisplay";
import Modal from "./components/Modal/Modal";

function App() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  // const [captchaToken, setCaptchaToken] = useState(null);
  const [count, setCount] = useState(0);
  const captchaRef = useRef();

  // State for URL history
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("urlHistory");
    return saved ? JSON.parse(saved) : [];
  });

  // State to control modal visibility
  const [showHistory, setShowHistory] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/shorten`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Server error:", data);
      if (data.captchaRequired) {
        alert("Service needs captcha to prove you're not a bot, please do it.");
      } else {
        alert(data.error || "Server error");
      }
      return;
    }

    setShortUrl(data.shortUrl || "");
    if (typeof data.count === "number") setCount(data.count);
    else setCount((prev) => prev + 1);

    if (captchaRef.current) {
      captchaRef.current.resetCaptcha?.();
    }

    // update history (просто додаємо новий запис з часом)
    setHistory((prev) => {
      const now = Date.now();
      const updated = [
        { original: url, short: data.shortUrl, createdAt: now },
        ...prev,
      ];

      localStorage.setItem("urlHistory", JSON.stringify(updated));
      return updated;
    });

    setUrl("");
  } catch (err) {
    console.error("Request error:", err);
    alert("Request error");
  }
};

  return (
    <div>
      <Title />
      <Description
        description="Transform long URLs into clean, shareable links"
        withPadding
      />
      <UrlForm url={url} setUrl={setUrl} onSubmit={handleSubmit} />
      {shortUrl && (
        <ShortUrlDisplay
          shortUrl={shortUrl}
          onOpenHistory={() => setShowHistory(true)}
        />
      )}

      {showHistory && (
        <Modal onClose={() => setShowHistory(false)} ariaLabel="Link history">
          <div>
            <UrlHistory history={history} setHistory={setHistory} />
          </div>
        </Modal>
      )}
    </div>
  );
}
export default App;
