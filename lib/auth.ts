import crypto from "crypto";
import { getDb } from "./db";

export const SESSION_COOKIE = "medsync_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const PBKDF_ITERATIONS = 100_000;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, PBKDF_ITERATIONS, 64, "sha512").toString("hex");
  return `${PBKDF_ITERATIONS}:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 3) return false;
  const [iterations, salt, hash] = parts;
  const candidate = crypto.pbkdf2Sync(password, salt, Number(iterations), 64, "sha512").toString("hex");
  const a = Buffer.from(candidate, "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export interface SessionUser {
  id: string;
  email: string;
}

export function createSession(userId: string): { token: string; expiresAt: string } {
  const db = getDb();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  const id = `session-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  db.prepare(
    "INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)"
  ).run(id, userId, sha256(token), expiresAt);
  return { token, expiresAt };
}

export function destroySession(token: string) {
  getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").run(sha256(token));
}

export function getSessionUser(request?: Request | null): SessionUser | null {
  const cookieHeader = request?.headers.get("cookie") ?? "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  if (!match) return null;
  const token = match.slice(SESSION_COOKIE.length + 1);
  if (!token) return null;

  const row: any = getDb()
    .prepare(
      `SELECT users.id, users.email FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash = ? AND sessions.expires_at > ?`
    )
    .get(sha256(token), new Date().toISOString());

  return row ? { id: row.id, email: row.email } : null;
}

export function sessionCookie(token: string): string {
  const isProd = process.env.NODE_ENV === "production";
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${
    isProd ? "; Secure" : ""
  }`;
}

export function clearSessionCookie(): string {
  const isProd = process.env.NODE_ENV === "production";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${
    isProd ? "; Secure" : ""
  }`;
}