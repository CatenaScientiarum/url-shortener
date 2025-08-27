import { useState, useRef } from "react";
import "./App.css";
import Title from "./components/Title/Title";
import Description from "./components/Description/Description";
import UrlForm from "./components/UrlForm/UrlForm";
import UrlHistory from "./components/UrlHistory/UrlHistory";
import ShortUrlDisplay from "./components/ShortUrlDisplay/ShortUrlDisplay";
import Modal from "./components/Modal/Modal";
import CaptchaWindow from "./components/Captcha/CaptchaWindow";

function App() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [count, setCount] = useState(0);
  const [captchaVisible, setCaptchaVisible] = useState(false);
  const pendingUrlRef = useRef(null);

  // URL history
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("urlHistory");
    return saved ? JSON.parse(saved) : [];
  });

  const [showHistory, setShowHistory] = useState(false);

  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

  const postUrl = async (payload) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/shorten`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    let data = {};
    try {
      data = await res.json();
    } catch (err) {
      console.warn("Failed to parse JSON response:", err);
    }

    return { res, data };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payloadUrl = url;

    try {
      const { res, data } = await postUrl({ url: payloadUrl });

      if (!res.ok) {
        if (data && data.captchaRequired) {
          pendingUrlRef.current = url;
          setCaptchaVisible(true);
          return;
        }

        alert((data && data.error) || "Server error");
        return;
      }

      // Update short URL and count
      setShortUrl(data.shortUrl || "");
      setCount(typeof data.count === "number" ? data.count : (prev) => prev + 1);

      // Update history
      setHistory((prev) => {
        const now = Date.now();
        const updated = [
          { original: payloadUrl, short: data.shortUrl, createdAt: now },
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

  const onCaptchaVerify = async (token) => {
    setCaptchaVisible(false);

    const payloadUrl = pendingUrlRef.current || url;
    pendingUrlRef.current = null;

    try {
      const { res, data } = await postUrl({ url: payloadUrl, token });

      if (!res.ok) {
        alert((data && data.error) || "Server error");
        return;
      }

      setShortUrl(data.shortUrl || "");
      setCount(typeof data.count === "number" ? data.count : (prev) => prev + 1);

      // Update history
      setHistory((prev) => {
        const now = Date.now();
        const updated = [
          { original: payloadUrl, short: data.shortUrl, createdAt: now },
          ...prev,
        ];
        localStorage.setItem("urlHistory", JSON.stringify(updated));
        return updated;
      });

      setUrl("");
    } catch (err) {
      console.error("Request after captcha error:", err);
      alert("Request error");
    }
  };

  const onCaptchaCancel = () => {
    setCaptchaVisible(false);
  };

  return (
    <div>
      <Title />
      <Description description="Transform long URLs into clean, shareable links" withPadding />

      <UrlForm url={url} setUrl={setUrl} onSubmit={handleSubmit} />

      <div className={`result-area ${shortUrl ? "visible" : ""}`}>
        {shortUrl && <ShortUrlDisplay shortUrl={shortUrl} onOpenHistory={() => setShowHistory(true)} />}
      </div>

      {showHistory && (
        <Modal onClose={() => setShowHistory(false)} ariaLabel="Link history">
          <UrlHistory history={history} setHistory={setHistory} />
        </Modal>
      )}

      {siteKey && (
        <CaptchaWindow
          siteKey={siteKey}
          visible={captchaVisible}
          onVerify={onCaptchaVerify}
          onCancel={onCaptchaCancel}
        />
      )}
    </div>
  );
}

export default App;
