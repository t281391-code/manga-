type Bucket = {
  count: number;
  expiresAt: number;
};

const globalForRateLimit = globalThis as unknown as {
  rateLimitStore?: Map<string, Bucket>;
};

const store = globalForRateLimit.rateLimitStore ?? new Map<string, Bucket>();
globalForRateLimit.rateLimitStore = store;

export function checkRateLimit(
  key: string,
  limit = 5,
  windowMs = 60 * 1000
) {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.expiresAt < now) {
    store.set(key, {
      count: 1,
      expiresAt: now + windowMs,
    });
    return { allowed: true, remaining: limit - 1 };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  existing.count += 1;
  store.set(key, existing);

  return { allowed: true, remaining: limit - existing.count };
}