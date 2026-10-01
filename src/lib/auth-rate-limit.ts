import { createHash } from "node:crypto";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const MAX_TRACKED_KEYS = 10_000;

type AttemptWindow = {
  failures: number;
  expiresAt: number;
};

const attempts = new Map<string, AttemptWindow>();

function makeKey(ipAddress: string, login: string): string {
  return createHash("sha256")
    .update(`${ipAddress}\0${login.trim().toLowerCase()}`)
    .digest("hex");
}

function cleanupExpired(now: number): void {
  for (const [key, entry] of attempts) {
    if (entry.expiresAt <= now) attempts.delete(key);
  }
}

export function getLoginRateLimit(
  ipAddress: string,
  login: string,
  now = Date.now(),
) {
  cleanupExpired(now);
  const entry = attempts.get(makeKey(ipAddress, login));

  if (!entry || entry.failures < MAX_FAILURES) {
    return { blocked: false, retryAfterSeconds: 0 };
  }

  return {
    blocked: true,
    retryAfterSeconds: Math.max(1, Math.ceil((entry.expiresAt - now) / 1000)),
  };
}

export function recordFailedLogin(
  ipAddress: string,
  login: string,
  now = Date.now(),
): void {
  cleanupExpired(now);
  const key = makeKey(ipAddress, login);
  const existing = attempts.get(key);

  if (!existing || existing.expiresAt <= now) {
    if (attempts.size >= MAX_TRACKED_KEYS) {
      const oldestKey = attempts.keys().next().value;
      if (oldestKey) attempts.delete(oldestKey);
    }

    attempts.set(key, { failures: 1, expiresAt: now + WINDOW_MS });
    return;
  }

  existing.failures += 1;
}

export function clearLoginFailures(ipAddress: string, login: string): void {
  attempts.delete(makeKey(ipAddress, login));
}
