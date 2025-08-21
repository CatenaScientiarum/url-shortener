const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const { nanoid } = require("nanoid");
require("dotenv").config();
const session = require("express-session");

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(session({

  secret: process.env.SESSION_SECRET || "keyboard_cat_dev_secret",
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 24*60*60*1000 }
}));

// global fetch
const doFetch = (url, opts) => fetch(url, opts);
//database enter
const DB_FILE = process.env.DATABASE_URL || "./data/urls.db";
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error("Cannot open DB:", err);
    process.exit(1);
  }
  console.log("DB opened at", DB_FILE);
});

db.run(
  `CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    short_id TEXT UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  (err) => {
    if (err) console.error("Table create error:", err);
    else console.log("Table ready");
  }
);

// usage endpoint
app.get("/usage", (req, res) => {
  if (!req.session.count) req.session.count = 0;
  console.log("GET /usage, session:", req.session);
  res.json({ count: req.session.count });
});

//shortener logic for badadan
app.post("/shorten", (req, res) => {
  console.log("POST /shorten body:", req.body);
  const url = req.body && req.body.url;
  const token = req.body && req.body.token;

  if (!url) {
    console.log("No url in body");
    return res.status(400).json({ error: "url потрібен" });
  }

  if (typeof req.session.count !== "number") req.session.count = 0;
  const count = req.session.count;
  console.log("current session count:", count);
  //  hCaptcha
  const needsCaptcha = (count % 5 === 3);
  if (needsCaptcha) {
    if (!token) {
      console.log("Captcha required but no token");
      return res.status(400).json({ error: "captcha required", captchaRequired: true });
    }

    doFetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.HCAPTCHA_SECRET || "",
        response: token
      })
    })
    .then(r => r.json())
    .then(vd => {
      console.log("hCaptcha response:", vd);
      if (!vd.success) {
        return res.status(400).json({ error: "captcha failed", details: vd });
      }
      insertUrlAndRespond(url, req, res);
    })
    .catch(err => {
      console.error("Error contacting hCaptcha:", err);
      res.status(500).json({ error: "captcha verification error" });
    });

  } else {
    insertUrlAndRespond(url, req, res);
  }
});

// insert url
function insertUrlAndRespond(url, req, res) {
  const shortId = nanoid(6);
  const sql = `INSERT INTO urls (short_id, original_url) VALUES (?, ?)`;
  console.log("Inserting", shortId, url);

  db.run(sql, [shortId, url], function(err) {
    if (err) {
      console.error("Insert error:", err.message);
      
      return res.status(500).json({ error: "Не вдалося зберегти URL" });
    }
    req.session.count = (req.session.count || 0) + 1;
    console.log("New session count:", req.session.count);

    const shortUrl = req.protocol + "://" + req.get("host") + "/" + shortId;
    res.json({ shortUrl, count: req.session.count });
  });
}

// redirect logic
app.get("/:id", (req, res) => {
  const id = req.params.id;
  console.log("Redirect request for", id);
  db.get("SELECT original_url FROM urls WHERE short_id = ?", [id], (err, row) => {
    if (err) {
      console.error("DB get error:", err);
      return res.status(500).send("Server error");
    }
    if (!row) {
      console.log("Not found:", id);
      return res.status(404).send("Not found");
    }
    res.redirect(row.original_url);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server started on port", PORT));