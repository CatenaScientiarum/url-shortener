import { useState, useRef } from "react";
import "./App.css";
import Title from "./components/Title/Title";
import Description from "./components/Description/Description";
import UrlForm from "./components/UrlForm/UrlForm";
import ShortUrlDisplay from "./components/ShortUrlDisplay/ShortUrlDisplay";
import CaptchaWindow from "./components/Captcha/CaptchaWindow";

function App() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [count, setCount] = useState(0);
  const [captchaVisible, setCaptchaVisible] = useState(false);
  const pendingUrlRef = useRef(null);

  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

  const postUrl = async (payload) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/shorten`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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

    try {
      const { res, data } = await postUrl({ url });

      if (!res.ok) {
        if (data && data.captchaRequired) {
          pendingUrlRef.current = url;
          setCaptchaVisible(true);
          return;
        }

        alert((data && data.error) || "Server error");
        return;
      }

      setShortUrl(data.shortUrl || "");
      setCount(typeof data.count === "number" ? data.count : (prev) => prev + 1);
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
      <Description />
      <UrlForm url={url} setUrl={setUrl} onSubmit={handleSubmit} />
      <div className={`result-area ${shortUrl ? "visible" : ""}`}>
        {shortUrl && <ShortUrlDisplay shortUrl={shortUrl} />}
      </div>
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
