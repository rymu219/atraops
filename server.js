/**
 * AtraOps — application server.
 *
 * Serves the built app out of dist/ behind a login wall, and stores the
 * published demo dataset in Postgres so it lives on the server instead of in
 * one person's browser.
 *
 *   POST   /api/login          -> start a session
 *   POST   /api/logout         -> end it
 *   GET    /api/me             -> who am I
 *   GET    /api/state          -> the published dataset (any signed-in user)
 *   PUT    /api/state/:key     -> publish one key (editors only)
 *   DELETE /api/state/:key     -> remove one key (editors only)
 *   GET    /api/users          -> list accounts (editors only)
 *   POST   /api/users          -> create an account (editors only)
 *   POST   /api/users/:id/password -> reset a password (editors only)
 *   DELETE /api/users/:id      -> delete an account (editors only)
 *   GET    /api/health         -> service + database status (public)
 *
 * Everyone signed in reads the same dataset and gets their own copy in the
 * browser, so a viewer clicking around during a demo can't disturb what the
 * next person sees. Only editors publish changes back.
 *
 * The server runs without a database rather than crashing, so a missing
 * DATABASE_URL shows a clear error instead of a dead site.
 */
import express from "express";
import pg from "pg";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as auth from "./auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL || "";
const BOOTSTRAP_EMAIL = process.env.BOOTSTRAP_EMAIL || "";
const BOOTSTRAP_PASSWORD = process.env.BOOTSTRAP_PASSWORD || "";
const SECURE_COOKIES = process.env.NODE_ENV !== "development";

/* Attachments live inside the state blobs, so the default 100kb cap is far
   too small. Keep a ceiling anyway to avoid unbounded uploads. */
const BODY_LIMIT = "32mb";
const KEY_PATTERN = /^fieldops-[A-Za-z0-9_-]{1,64}$/;
const MIN_PASSWORD = 10;
const SEED_FILE = path.join(__dirname, "AtraOps-backend-LATEST.json");

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: BODY_LIMIT }));

let pool = null;
let dbReady = false;
let dbError = "";

async function initDb() {
  if (!DATABASE_URL) {
    dbError = "DATABASE_URL not set";
    console.warn("[atraops] no DATABASE_URL — running without persistence");
    return;
  }
  pool = new pg.Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
    max: 5,
  });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_state (
      key        TEXT PRIMARY KEY,
      value      JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await auth.schema(pool);
  await auth.bootstrap(pool, BOOTSTRAP_EMAIL, BOOTSTRAP_PASSWORD);
  dbReady = true;
  const { rows } = await pool.query("SELECT count(*)::int AS n FROM app_state");
  console.log(`[atraops] database ready — ${rows[0].n} state keys stored`);
}

/**
 * Loads the dataset from the backend export committed alongside the code.
 *
 * This NEVER runs on its own. The database is the home of the live data, and
 * nothing is allowed to overwrite or resurrect it automatically — an empty
 * database stays empty until a person decides otherwise. This exists only for
 * the initial load, and for deliberately resetting the demo from /users.
 */
async function seedState() {
  if (!fs.existsSync(SEED_FILE)) return { seeded: 0, reason: "no export file in the repo" };
  /* The export was written by a Windows browser and carries a BOM. */
  const pkg = JSON.parse(fs.readFileSync(SEED_FILE, "utf8").replace(/^\uFEFF/, ""));
  const data = pkg.data || {};
  const keys = pkg.keys && pkg.keys.length ? pkg.keys : Object.keys(data);
  let seeded = 0;
  for (const key of keys) {
    if (!KEY_PATTERN.test(key)) continue;
    const value = data[key];
    if (value === null || value === undefined) continue;
    await pool.query(
      `INSERT INTO app_state (key, value, updated_at) VALUES ($1, $2, now())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      [key, JSON.stringify(value)]
    );
    seeded++;
  }
  return { seeded, exportedAt: pkg.exportedAt };
}

/* ---------- middleware ---------- */

function requireDb(req, res, next) {
  if (!dbReady) return res.status(503).json({ error: "database unavailable", detail: dbError });
  next();
}

async function attachUser(req, res, next) {
  req.user = null;
  if (!dbReady) return next();
  try {
    const cookies = auth.parseCookies(req.get("cookie"));
    req.user = await auth.userForToken(pool, cookies[auth.COOKIE]);
  } catch (err) {
    console.error("[atraops] session lookup failed", err);
  }
  next();
}

function requireUser(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "not signed in" });
  next();
}

function requireEditor(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "not signed in" });
  if (req.user.role !== "editor") return res.status(403).json({ error: "editors only" });
  next();
}

/* ---------- public ---------- */

app.get("/api/health", (req, res) => {
  res.json({ ok: true, database: dbReady ? "connected" : "unavailable", detail: dbError || undefined });
});

app.use(attachUser);

app.post("/api/login", requireDb, async (req, res) => {
  const email = auth.normalizeEmail(req.body && req.body.email);
  const password = String((req.body && req.body.password) || "");
  if (!email || !password) return res.status(400).json({ error: "email and password required" });
  if (auth.lockedOut(email)) {
    return res.status(429).json({ error: "too many attempts — wait 15 minutes" });
  }
  try {
    const { rows } = await pool.query(
      `SELECT id, email, role, password_hash FROM users WHERE email = $1`,
      [email]
    );
    const user = rows[0];
    const ok = user && (await auth.verifyPassword(password, user.password_hash));
    if (!ok) {
      auth.noteFailure(email);
      /* Same message either way, so this can't be used to discover accounts. */
      return res.status(401).json({ error: "invalid email or password" });
    }
    auth.clearFailures(email);
    const { token, expires } = await auth.startSession(pool, user.id);
    res.set("Set-Cookie", auth.cookieHeader(token, expires, SECURE_COOKIES));
    res.json({ ok: true, email: user.email, role: user.role });
  } catch (err) {
    console.error("[atraops] login failed", err);
    res.status(500).json({ error: "login failed" });
  }
});

app.post("/api/logout", async (req, res) => {
  try {
    const cookies = auth.parseCookies(req.get("cookie"));
    if (dbReady) await auth.endSession(pool, cookies[auth.COOKIE]);
  } catch (err) {
    console.error("[atraops] logout failed", err);
  }
  res.set("Set-Cookie", auth.clearCookieHeader(SECURE_COOKIES));
  res.json({ ok: true });
});

app.get("/api/me", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "not signed in" });
  res.json({ email: req.user.email, role: req.user.role });
});

/* Login page, and the only other thing reachable while signed out. */
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "auth", "login.html")));

/* ---------- state ---------- */

app.get("/api/state", requireDb, requireUser, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT key, value FROM app_state");
    const out = {};
    for (const row of rows) out[row.key] = row.value;
    res.json({ keys: Object.keys(out), data: out });
  } catch (err) {
    console.error("[atraops] state read failed", err);
    res.status(500).json({ error: "read failed" });
  }
});

app.put("/api/state/:key", requireDb, requireEditor, async (req, res) => {
  const { key } = req.params;
  if (!KEY_PATTERN.test(key)) return res.status(400).json({ error: "invalid key" });
  if (!Object.prototype.hasOwnProperty.call(req.body || {}, "value")) {
    return res.status(400).json({ error: "body must be {value: ...}" });
  }
  try {
    await pool.query(
      `INSERT INTO app_state (key, value, updated_at) VALUES ($1, $2, now())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      [key, JSON.stringify(req.body.value)]
    );
    res.json({ ok: true, key });
  } catch (err) {
    console.error("[atraops] state write failed", key, err);
    res.status(500).json({ error: "write failed" });
  }
});

app.delete("/api/state/:key", requireDb, requireEditor, async (req, res) => {
  const { key } = req.params;
  if (!KEY_PATTERN.test(key)) return res.status(400).json({ error: "invalid key" });
  try {
    await pool.query("DELETE FROM app_state WHERE key = $1", [key]);
    res.json({ ok: true, key });
  } catch (err) {
    console.error("[atraops] state delete failed", key, err);
    res.status(500).json({ error: "delete failed" });
  }
});

app.post("/api/seed", requireDb, requireEditor, async (req, res) => {
  try {
    const result = await seedState();
    res.json({ ok: true, ...result });
  } catch (err) {
    console.error("[atraops] reseed failed", err);
    res.status(500).json({ error: "reseed failed: " + err.message });
  }
});

/* ---------- users ---------- */

app.get("/api/users", requireDb, requireEditor, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, email, role, created_at FROM users ORDER BY created_at`
  );
  res.json({ users: rows });
});

app.post("/api/users", requireDb, requireEditor, async (req, res) => {
  const email = auth.normalizeEmail(req.body && req.body.email);
  const password = String((req.body && req.body.password) || "");
  const role = (req.body && req.body.role) === "editor" ? "editor" : "viewer";
  if (!email.includes("@")) return res.status(400).json({ error: "valid email required" });
  if (password.length < MIN_PASSWORD) {
    return res.status(400).json({ error: `password must be at least ${MIN_PASSWORD} characters` });
  }
  try {
    const user = await auth.createUser(pool, email, password, role);
    res.json({ ok: true, user });
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "that email already exists" });
    console.error("[atraops] create user failed", err);
    res.status(500).json({ error: "create failed" });
  }
});

app.post("/api/users/:id/password", requireDb, requireEditor, async (req, res) => {
  const id = Number(req.params.id);
  const password = String((req.body && req.body.password) || "");
  if (!Number.isInteger(id)) return res.status(400).json({ error: "invalid id" });
  if (password.length < MIN_PASSWORD) {
    return res.status(400).json({ error: `password must be at least ${MIN_PASSWORD} characters` });
  }
  try {
    await auth.setPassword(pool, id, password);
    res.json({ ok: true });
  } catch (err) {
    console.error("[atraops] password reset failed", err);
    res.status(500).json({ error: "reset failed" });
  }
});

app.delete("/api/users/:id", requireDb, requireEditor, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "invalid id" });
  if (id === req.user.id) return res.status(400).json({ error: "you can't delete your own account" });
  try {
    await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error("[atraops] delete user failed", err);
    res.status(500).json({ error: "delete failed" });
  }
});

app.get("/users", requireDb, (req, res) => {
  if (!req.user || req.user.role !== "editor") return res.redirect("/login");
  res.sendFile(path.join(__dirname, "auth", "users.html"));
});

/* ---------- the app, behind the wall ---------- */

const DIST = path.join(__dirname, "dist");

app.use((req, res, next) => {
  if (req.user) return next();
  /* Asset requests get a clean 401; page requests get sent to the login form. */
  if (path.extname(req.path)) return res.status(401).json({ error: "not signed in" });
  res.redirect("/login");
});

app.use(express.static(DIST, { extensions: ["html"] }));

app.get("*", (req, res) => {
  /* Anything that looks like a file and wasn't found in dist/ is genuinely
     missing — 404 rather than handing back index.html, so the backend export
     and the source files get an honest answer. */
  if (path.extname(req.path)) return res.status(404).json({ error: "not found" });
  res.sendFile(path.join(DIST, "index.html"));
});

initDb()
  .catch((err) => {
    dbError = err.message;
    console.error("[atraops] database init failed", err);
  })
  .finally(() => {
    app.listen(PORT, () => console.log(`[atraops] listening on ${PORT}`));
  });
