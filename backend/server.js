//  I used `import` for modern codebases, better tooling, static analysis, and compatibility with front-end frameworks.
import dotenv from "dotenv"; // Loads environment variables from a .env file
import express from "express"; // Imports the Express web framework. We are using it to create a web server.
import cors from "cors"; // Allows your server to accept requests from other origins (like frontend).
import { nanoid } from "nanoid"; // Imports a function to generate unique IDs. Used to create short, unique URLs for your URL shortener.
import session from "express-session"; // Session middleware for managing user sessions (cookies, counters, etc.)
import http from "http"; // Node.js HTTP module, used to create the server for both Express and Socket.io
import postgres from "postgres"; // PostgreSQL client for connecting and querying your Supabase/Postgres database
import * as socketio from "socket.io"; // Real-time communication library, enables WebSocket features (chat, notifications, etc.)

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


// Shorten URL endpoint
app.post("/api/shorten", (req, res) => {
  console.log("POST /shorten body:", req.body);
  const url = req.body && req.body.url;
  // const token = req.body && req.body.token; // Only needed if captcha is enabled

  if (!url) {
    console.log("No url in body");
    return res.status(400).json({ error: "url потрібен" });
  }

  if (typeof req.session.count !== "number") req.session.count = 0;
  // ---- CAPTCHA DISABLED ----
  // The following block enables hCaptcha. To enable, uncomment and adjust as needed.
  /*
  const count = req.session.count;
  const needsCaptcha = count % 5 === 3;
  if (needsCaptcha) {
    if (!token) {
      console.log("Captcha required but no token");
      return res
        .status(400)
        .json({ error: "captcha required", captchaRequired: true });
    }

    fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.HCAPTCHA_SECRET || "",
        response: token,
      }),
    })
      .then((r) => r.json())
      .then((vd) => {
        console.log("hCaptcha response:", vd);
        if (!vd.success) {
          return res.status(400).json({ error: "captcha failed", details: vd });
        }
        insertUrlAndRespond(url, req, res);
      })
      .catch((err) => {
        console.error("Error contacting hCaptcha:", err);
        res.status(500).json({ error: "captcha verification error" });
      });
    return; // Prevent double response
  }
  */
  // ---- END CAPTCHA BLOCK ----

  // Directly insert without captcha
  insertUrlAndRespond(url, req, res);
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
