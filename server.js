/**
 * AtraOps — static host + state sync API.
 *
 * Serves the built app out of dist/ and exposes a small state store so the
 * demo dataset lives on the server instead of in one person's browser.
 *
 *   GET  /api/state          -> every stored fieldops-* key (public read)
 *   PUT  /api/state/:key     -> write one key (requires EDITOR_TOKEN)
 *   DELETE /api/state/:key   -> remove one key (requires EDITOR_TOKEN)
 *   GET  /api/health         -> service + database status
 *
 * Reads are public on purpose: every visitor seeds their own browser from
 * the server copy, then edits locally without affecting anyone else.
 * Writes are locked behind a token so only the editor can change the
 * published dataset.
 *
 * Runs without a database too — it just serves the app and reports
 * degraded health, so a missing DATABASE_URL never takes the site down.
 */
import express from "express";
import pg from "pg";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const EDITOR_TOKEN = process.env.EDITOR_TOKEN || "";
const DATABASE_URL = process.env.DATABASE_URL || "";

/* Attachments live inside the state blobs, so the default 100kb cap is far
   too small. Keep a ceiling anyway to avoid unbounded uploads. */
const BODY_LIMIT = "32mb";

/* Only app state is storable. Anything else is rejected outright. */
const KEY_PATTERN = /^fieldops-[A-Za-z0-9_-]{1,64}$/;

const app = express();
app.disable("x-powered-by");
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
  dbReady = true;
  console.log("[atraops] database ready");
}

function requireEditor(req, res, next) {
  if (!EDITOR_TOKEN) {
    return res.status(503).json({ error: "EDITOR_TOKEN not configured; writes disabled" });
  }
  const sent = req.get("x-editor-token") || "";
  /* Length check first so the comparison below can't be used as an oracle. */
  if (sent.length !== EDITOR_TOKEN.length || sent !== EDITOR_TOKEN) {
    return res.status(401).json({ error: "invalid editor token" });
  }
  next();
}

function requireDb(req, res, next) {
  if (!dbReady) return res.status(503).json({ error: "database unavailable", detail: dbError });
  next();
}

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    database: dbReady ? "connected" : "unavailable",
    writes: EDITOR_TOKEN ? "enabled" : "disabled",
    detail: dbError || undefined,
  });
});

app.get("/api/state", requireDb, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT key, value FROM app_state");
    const out = {};
    for (const row of rows) out[row.key] = row.value;
    res.json({ keys: Object.keys(out), data: out });
  } catch (err) {
    console.error("[atraops] read failed", err);
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
    console.error("[atraops] write failed", key, err);
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
    console.error("[atraops] delete failed", key, err);
    res.status(500).json({ error: "delete failed" });
  }
});

/* Static app. dist/ is produced by build.sh and holds only index.html,
   css/ and js/ — never the backend export or the internal docs. */
const DIST = path.join(__dirname, "dist");
app.use(express.static(DIST, { extensions: ["html"] }));
app.get("*", (req, res) => {
  /* Anything that looks like a file and wasn't found in dist/ is genuinely
     missing — 404 it rather than handing back index.html, so a request for
     the backend export or a source file gets an honest answer. */
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
