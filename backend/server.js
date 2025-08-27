//  I used `import` for modern codebases, better tooling, static analysis, and compatibility with front-end frameworks.
import dotenv from "dotenv"; // Loads environment variables from a .env file
import express from "express"; // Imports the Express web framework. We are using it to create a web server.
import cors from "cors"; // Allows your server to accept requests from other origins (like frontend).
import { nanoid } from "nanoid"; // Imports a function to generate unique IDs. Used to create short, unique URLs for your URL shortener.
import session from "express-session"; // Session middleware for managing user sessions (cookies, counters, etc.)
import http from "http"; // Node.js HTTP module, used to create the server for both Express and Socket.io
import postgres from "postgres"; // PostgreSQL client for connecting and querying your Supabase/Postgres database
import * as socketio from "socket.io"; // Real-time communication library, enables WebSocket features (chat, notifications, etc.)
import fetch from "node-fetch"; //Used for HTTP requests to the API

dotenv.config(); //  load environment variables from the .env file

const app = express();

app.use(cors({ origin: "http://localhost:5555", credentials: true })); // Enable CORS for the frontend URL
app.use(express.json()); // to parse JSON body
const server = http.createServer(app);
const io = new socketio.Server(server, {
  // creates Socket.io server instance using CORS and MIME types
  // https://socket.io/docs/v4/handling-cors/ - CORS
  // creates Socket.io server instance using CORS and MIME types
  cors: {
    // Cross-Origin Resource Sharing
    // is an HTTP-header based mechanism that allows a server to indicate any origins (domain, scheme, or port)
    // other than its own from which a browser should permit loading resources.
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// It allows your server to track data for each user across multiple requests using 
// cookies (for example, how many links a user has shortened in their session).
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret", // is used to sign the session ID cookie, keeping it secure.
    resave: false, // avoids saving sessions that haven’t changed.
    saveUninitialized: true, // saves new sessions even if they haven’t been modified.
  })
);

const PORT = 5000;

// sql integration
// postgres client for connecting to Supabase/Postgres database
const sql = postgres(process.env.DATABASE_URL, {
  prepare: false,
  ssl: {
    rejectUnauthorized: true,
    ca: process.env.SUPABASE_DB_CA_CERT,
  },
});

// Test connection on start
(async () => {
  try {
    const res = await sql`SELECT NOW()`;
    console.log("Connected to PostgreSQL at:", res[0].now);
  } catch (err) {
    console.error("PostgreSQL connection error:", err);
  }
})();
// Helper: verify recaptcha token with Google
async function verifyRecaptcha(token, remoteip) {
  const secret = process.env.RECAPTCHA_SECRET || "";
  if (!secret) {
    throw new Error("RECAPTCHA_SECRET not configured in environment");
  }

  const params = new URLSearchParams({ secret, response: token });
  if (remoteip) params.append("remoteip", remoteip);

  try {
    const resp = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const json = await resp.json();
    return json;
  } catch (err) {
    console.error("Network/parse error during reCAPTCHA verify:", err);
    return null;
  }
}

/**
 * Manual verification endpoint (useful for debugging)
 * POST { token: "..." } -> returns verification JSON and logs it
 */
app.post("/api/verify", async (req, res) => {
  const token = req.body && (req.body.token || req.body["g-recaptcha-response"]);
  if (!token) return res.status(400).json({ error: "token required" });

  try {
    const verification = await verifyRecaptcha(token, req.ip);
    console.log("Manual /api/verify -> verification:", verification);
    if (!verification) return res.status(500).json({ error: "verify failed (network/parse)" });
    return res.json({ verification });
  } catch (err) {
    console.error("Error in /api/verify:", err);
    return res.status(500).json({ error: "internal error" });
  }
});

//Shorten URL endpoint with reCAPTCHA check
app.post("/api/shorten", async (req, res) => {
  console.log("POST /api/shorten body:", req.body);
  const url = req.body && req.body.url;
  const token = req.body && req.body.token;

  if (!url) {
    console.log("No url in body");
    return res.status(400).json({ error: "URL is required" });
  }

  // init session counters/timestamps
  if (typeof req.session.count !== "number") req.session.count = 0;
  if (!Array.isArray(req.session.attemptTimestamps)) req.session.attemptTimestamps = [];

  // sliding window timestamps (keep last 60s)
  const now = Date.now();
  req.session.attemptTimestamps.push(now);
  req.session.attemptTimestamps = req.session.attemptTimestamps.filter(t => now - t < 60_000);
  const attemptsLastMinute = req.session.attemptTimestamps.length;

  // heuristics
  const userAgent = (req.headers['user-agent'] || "").toLowerCase();
  const suspiciousUA = /curl|wget|bot|spider|crawler|python|java|libwww|scrapy|okhttp/i.test(userAgent);
  const noCookies = !req.headers.cookie;
  const ip = req.ip || req.connection?.remoteAddress || "";

  // config via env
  const FORCE_CAPTCHA = process.env.FORCE_CAPTCHA === "1";
  const randomSamplePercent = parseFloat(process.env.CAPTCHA_SAMPLE || "0.08"); //  8%
  const randomSample = Math.random() < randomSamplePercent;
  const rateTrigger = attemptsLastMinute >= (parseInt(process.env.CAPTCHA_RATE_THRESHOLD || "8", 10)); // default 8/min

  // combine rules (logical OR)
  let needsCaptcha = FORCE_CAPTCHA || rateTrigger || suspiciousUA || noCookies || randomSample;

  // If client provided token — verify it immediately and possibly clear needsCaptcha
  if (token) {
    try {
      const verification = await verifyRecaptcha(token, req.ip);
      console.log("reCAPTCHA verification result:", verification);

      if (!verification) {
        console.log("Verification returned null (network/parse error).");
        return res.status(500).json({ error: "Captcha verification error" });
      }

      if (!verification.success) {
        console.log("Captcha verification failed:", verification["error-codes"] || verification);
        // verification failed -> still challenge
        return res.status(400).json({ error: "Captcha verification failed", details: verification, captchaRequired: true });
      }

      // if v3 score present — use it to avoid challenge
      if (typeof verification.score === "number") {
        const threshold = parseFloat(process.env.RECAPTCHA_V3_THRESHOLD || "0.55");
        console.log(`reCAPTCHA v3 score: ${verification.score} (threshold ${threshold})`);
        if (verification.score >= threshold) {
          needsCaptcha = false; // passed v3 => do not require interactive challenge
        } else {
          // score low => require interactive
          return res.status(400).json({ error: "Low recaptcha score", captchaRequired: true, details: { score: verification.score }});
        }
      } else {
        // v2 success -> ok
        needsCaptcha = false;
      }
    } catch (err) {
      console.error("Error verifying reCAPTCHA:", err);
      return res.status(500).json({ error: "Captcha verification error" });
    }
  }

  /* If still needs captcha and no token -> ask client to show interactive captcha
  if (needsCaptcha && !token) {
    console.log("Captcha required (reason):", {
      attemptsLastMinute,
      rateTrigger,
      suspiciousUA,
      noCookies,
      randomSample
    });
    return res.status(400).json({
      error: "Captcha required",
      captchaRequired: true,
      reason: { attemptsLastMinute, rateTrigger, suspiciousUA, noCookies, randomSample, ip }
    });
  }
  */

  // Passed checks -> insert URL and respond
  try {
    await insertUrlAndRespond(url, req, res);
  } catch (err) {
    console.error("Insert workflow error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
});

// insert url
async function insertUrlAndRespond(url, req, res) {
  const shortId = nanoid(6);
  console.log("Inserting", shortId, url);
  try {
    await sql`
      INSERT INTO urls (short_id, original_url)
      VALUES (${shortId}, ${url})
    `;
    req.session.count = (req.session.count || 0) + 1;
    console.log("New session count:", req.session.count);
    const shortUrl = req.protocol + "://" + req.get("host") + "/" + shortId;
    res.json({ shortUrl, count: req.session.count });
  } catch (err) {
    console.error("Insert error:", err.message);
    res.status(500).json({ error: "We can not save your URL" });
  }
}

// // redirect logic
app.get("/:id", async (req, res) => {
  const id = req.params.id;
  console.log("Redirect request for", id);
  try {
    const rows = await sql`
      SELECT original_url FROM urls WHERE short_id = ${id}
    `;
    if (rows.length === 0) {
      console.log("Not found:", id);
      return res.status(404).send("Not found");
    }
    res.redirect(rows[0].original_url);
  } catch (err) {
    console.error("DB get error:", err);
    res.status(500).send("Server error");
  }
});

// app.get("/api/usage", (req, res) => {
//   if (!req.session) req.session = {};
//   if (typeof req.session.count !== "number") req.session.count = 0;
//   res.json({ count: 0 }); // Return dummy count for now
// });

app.listen(PORT, () => console.log("Server started on port", PORT));
