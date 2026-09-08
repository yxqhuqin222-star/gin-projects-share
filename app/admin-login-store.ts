import { getD1 } from "../db";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

type Attempt = {
  failedCount: number;
  windowStartedAt: string;
  blockedUntil: string | null;
};

function nowIso() {
  return new Date().toISOString();
}

async function attemptKey(request: Request) {
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function loginRetryAfter(request: Request) {
  const key = await attemptKey(request);
  const attempt = await (await getD1())
    .prepare(
      `SELECT failed_count AS failedCount, window_started_at AS windowStartedAt,
       blocked_until AS blockedUntil FROM admin_login_attempts WHERE key = ? LIMIT 1`,
    )
    .bind(key)
    .first<Attempt>();
  if (!attempt?.blockedUntil) return 0;
  return Math.max(0, Math.ceil((Date.parse(attempt.blockedUntil) - Date.now()) / 1000));
}

export async function recordFailedLogin(request: Request) {
  const key = await attemptKey(request);
  const database = await getD1();
  const current = await database
    .prepare(
      `SELECT failed_count AS failedCount, window_started_at AS windowStartedAt,
       blocked_until AS blockedUntil FROM admin_login_attempts WHERE key = ? LIMIT 1`,
    )
    .bind(key)
    .first<Attempt>();
  const now = Date.now();
  const resetWindow = !current || Date.parse(current.windowStartedAt) <= now - WINDOW_MS;
  const failedCount = (resetWindow ? 0 : current.failedCount) + 1;
  const windowStartedAt = resetWindow ? nowIso() : current.windowStartedAt;
  const blockedUntil = failedCount >= MAX_FAILURES
    ? new Date(now + WINDOW_MS).toISOString()
    : null;

  await database
    .prepare(
      `INSERT INTO admin_login_attempts (key, failed_count, window_started_at, blocked_until)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET failed_count = excluded.failed_count,
       window_started_at = excluded.window_started_at, blocked_until = excluded.blocked_until`,
    )
    .bind(key, failedCount, windowStartedAt, blockedUntil)
    .run();
  return blockedUntil ? Math.ceil(WINDOW_MS / 1000) : 0;
}

export async function clearLoginFailures(request: Request) {
  const key = await attemptKey(request);
  await (await getD1())
    .prepare("DELETE FROM admin_login_attempts WHERE key = ?")
    .bind(key)
    .run();
}
