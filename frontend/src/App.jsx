import { useState, useEffect, useRef } from "react";
// import HCaptcha from "@hcaptcha/react-hcaptcha";
import "./App.css";
import "./normalize.css";
import Title from "./components/Title/Title";
import Description from "./components/Description/Description";
import UrlForm from "./components/UrlForm/UrlForm";
import UrlHistory from "./components/UrlHistory/UrlHistory";
import ShortUrlDisplay from "./components/ShortUrlDisplay/ShortUrlDisplay";


function App() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  // const [captchaToken, setCaptchaToken] = useState(null);
  const [count, setCount] = useState(0);
  const captchaRef = useRef();

  // rewrite - cause of CORS issues
  // useEffect(() => {
  //   fetch(`${import.meta.env.VITE_API_URL}/api/usage`, {
  //     credentials: "include"
  //   })
  //     .then((r) => r.json())
  //     .then((data) => {
  //       setCount(data.count || 0);
  //     })
  //     .catch((e) => console.error(e));
  // }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // const needsCaptcha = (count % 5 === 3);
    // if (needsCaptcha && !captchaToken) {
    //   alert("Do captcha before URL");
    //   return;
    // }

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
          alert(
            "Service needs captcha to prove you re not a bot,please do it."
          );
        } else {
          alert(data.error || "Server error");
        }
        return;
      }

      setShortUrl(data.shortUrl || "");
      if (typeof data.count === "number") setCount(data.count);
      else setCount((prev) => prev + 1);

      if (captchaRef.current) {
        captchaRef.current.resetCaptcha();
        setCaptchaToken(null);
      }
      setUrl("");
    } catch (err) {
      console.error("Request error:", err);
      alert("Request error");
    }
  };

  
  return (
    <div>
      <Title />
      <Description description="Transform long URLs into clean, shareable links" withPadding/>
      <UrlForm url={url} setUrl={setUrl} onSubmit={handleSubmit} />
      {shortUrl && <ShortUrlDisplay shortUrl={shortUrl} />}
      <Description description= "Link History"/>
      <UrlHistory url={url} setUrl={setUrl} onSubmit={handleSubmit} />
    </div>
  );
}

export default App;
