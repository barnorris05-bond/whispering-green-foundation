/**
 * Very small in-memory rate limiter for public forms (localhost MVP).
 * Limitation (documented in README): state resets on server restart and is
 * per-process, not shared. Fine for a demo; not production-grade.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export interface RateResult {
  ok: boolean;
  retryAfterSec: number;
}

export function rateLimit(key: string, limit = 5, windowMs = 10 * 60 * 1000): RateResult {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  entry.count += 1;
  if (entry.count > limit) {
    return { ok: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfterSec: 0 };
}

export function clientKey(req: Request, scope: string): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "local";
  return `${scope}:${fwd}`;
}

// Periodic cleanup so the map does not grow unbounded during a long demo.
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
  }, 60_000);
  if (typeof timer === "object" && "unref" in timer) timer.unref();
}
