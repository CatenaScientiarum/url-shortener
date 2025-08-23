import { useState,useEffect, useRef } from "react";
// import HCaptcha from "@hcaptcha/react-hcaptcha";
import "./App.css";

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
      body: JSON.stringify({ url })
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Server error:", data);
      if (data.captchaRequired) {
        alert("Service needs captcha to prove you re not a bot,please do it.");
      } else {
        alert(data.error || "Server error");
      }
      return;
    }

    setShortUrl(data.shortUrl || "");
    if (typeof data.count === "number") setCount(data.count);
    else setCount(prev => prev + 1);

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
      <h1>URL shortening service</h1>
      
      {/* <p>Links created in session: {count}</p> */  /*cause of CORS issues*/} 

      <form onSubmit={handleSubmit}>
        <input
          type="url"
          value={url}
          placeholder="Enter URL..."
          onChange={(e) => setUrl(e.target.value)}
          required
        />

        {/* {(count % 5 === 3) && ( // cause of CORS issues
          <HCaptcha
          sitekey={siteKey}
          onVerify={(token) => setCaptchaToken(token)}
          ref={captchaRef}
          />
        )} */}

        <button type="submit">Do magic</button>
      </form>

      {shortUrl && (
        <p>
          Short Url: <a href={shortUrl} target="_blank" rel="noopener noreferrer">{shortUrl}</a>
        </p>
      )}

    </div>
  );
}

export default App;
