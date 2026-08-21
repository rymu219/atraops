/**
 * AtraOps — accounts and sessions.
 *
 * Passwords are hashed with scrypt from Node's own crypto module, so there's
 * no native build step and no dependency to keep patched. Sessions are rows
 * in Postgres rather than signed tokens, which means logging someone out
 * actually revokes their access instead of waiting for an expiry.
 *
 * Two roles:
 *   editor — can change the published dataset and manage users (you, Ben)
 *   viewer — can open the demo; their edits stay in their own browser
 */
import crypto from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(crypto.scrypt);

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 64;
const SESSION_DAYS = 30;
export const COOKIE = "atraops_sid";

/* Failed logins per email, cleared on success. Deters online guessing
   without needing a rate-limit service. */
const failures = new Map();
const MAX_FAILURES = 8;
const LOCKOUT_MS = 15 * 60 * 1000;

export async function schema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      email         TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'viewer',
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      token      TEXT PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id)`);
}

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password, salt, KEY_LEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P });
  return ["scrypt", SCRYPT_N, SCRYPT_R, SCRYPT_P, salt.toString("hex"), key.toString("hex")].join("$");
}

export async function verifyPassword(password, stored) {
  try {
    const [scheme, N, r, p, saltHex, keyHex] = String(stored).split("$");
    if (scheme !== "scrypt") return false;
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(keyHex, "hex");
    const actual = await scrypt(password, salt, expected.length, {
      N: Number(N),
      r: Number(r),
      p: Number(p),
    });
    return crypto.timingSafeEqual(expected, actual);
  } catch (e) {
    return false;
  }
}

export function lockedOut(email) {
  const rec = failures.get(email);
  if (!rec) return false;
  if (Date.now() - rec.at > LOCKOUT_MS) {
    failures.delete(email);
    return false;
  }
  return rec.count >= MAX_FAILURES;
}

export function noteFailure(email) {
  const rec = failures.get(email) || { count: 0, at: Date.now() };
  rec.count += 1;
  rec.at = Date.now();
  failures.set(email, rec);
}

export function clearFailures(email) {
  failures.delete(email);
}

export async function createUser(pool, email, password, role) {
  const hash = await hashPassword(password);
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)
     RETURNING id, email, role, created_at`,
    [normalizeEmail(email), hash, role === "editor" ? "editor" : "viewer"]
  );
  return rows[0];
}

export async function setPassword(pool, userId, password) {
  const hash = await hashPassword(password);
  await pool.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [hash, userId]);
  /* Force a fresh login everywhere once the password changes. */
  await pool.query(`DELETE FROM sessions WHERE user_id = $1`, [userId]);
}

export async function startSession(pool, userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000);
  await pool.query(`INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)`, [
    token,
    userId,
    expires,
  ]);
  return { token, expires };
}

export async function endSession(pool, token) {
  if (token) await pool.query(`DELETE FROM sessions WHERE token = $1`, [token]);
}

export async function userForToken(pool, token) {
  if (!token) return null;
  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.role
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token = $1 AND s.expires_at > now()`,
    [token]
  );
  return rows[0] || null;
}

export function parseCookies(header) {
  const out = {};
  String(header || "")
    .split(";")
    .forEach((part) => {
      const i = part.indexOf("=");
      if (i < 0) return;
      out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
    });
  return out;
}

export function cookieHeader(token, expires, secure) {
  const bits = [
    `${COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Expires=${expires.toUTCString()}`,
  ];
  if (secure) bits.push("Secure");
  return bits.join("; ");
}

export function clearCookieHeader(secure) {
  const bits = [`${COOKIE}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (secure) bits.push("Secure");
  return bits.join("; ");
}

/** Creates the first editor from env vars so there's a way in on a fresh database. */
export async function bootstrap(pool, email, password) {
  if (!email || !password) return null;
  const { rows } = await pool.query(`SELECT count(*)::int AS n FROM users`);
  if (rows[0].n > 0) return null;
  const user = await createUser(pool, email, password, "editor");
  console.log(`[auth] bootstrapped first editor: ${user.email}`);
  return user;
}
