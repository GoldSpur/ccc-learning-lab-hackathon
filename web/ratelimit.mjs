// Staging access controls: fixed-window rate limiting and per-identity
// quotas. Pure and injectable-clock for testing. Keys are identities
// (Access-authenticated email when present, else client IP) — never
// scenario content.

// createRateLimiter({ windowMs, max }) -> { check(key, now) }
export function createRateLimiter({ windowMs = 60_000, max = 30 } = {}) {
  const buckets = new Map();
  return {
    check(key, now = Date.now()) {
      const b = buckets.get(key);
      if (!b || now - b.start >= windowMs) {
        buckets.set(key, { start: now, count: 1 });
        return { allowed: true, remaining: max - 1 };
      }
      b.count++;
      if (b.count > max) return { allowed: false, retryAfterMs: b.start + windowMs - now };
      return { allowed: true, remaining: max - b.count };
    },
  };
}

// createQuota({ windowMs, limit }) -> { check(key, now) } — a slower window
// (default 24 h) capping how many demo runs one identity may make.
export function createQuota({ windowMs = 24 * 60 * 60 * 1000, limit = 200 } = {}) {
  const buckets = new Map();
  return {
    check(key, now = Date.now()) {
      const b = buckets.get(key);
      if (!b || now - b.start >= windowMs) {
        buckets.set(key, { start: now, count: 1 });
        return { allowed: true, remaining: limit - 1 };
      }
      b.count++;
      if (b.count > limit) return { allowed: false, retryAfterMs: b.start + windowMs - now };
      return { allowed: true, remaining: limit - b.count };
    },
  };
}
