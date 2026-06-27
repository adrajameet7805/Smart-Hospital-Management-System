const redis = require('../config/redis');

const DEFAULT_TTL = 60; // seconds

/**
 * Get data from cache or fetch and cache it
 * @param {string} key - Redis key
 * @param {Function} fetchFn - Async function to fetch data if cache miss
 * @param {number} ttl - Time to live in seconds
 */
async function getOrSet(key, fetchFn, ttl = DEFAULT_TTL) {
  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);
  } catch {
    // Redis down — fall through to fetch
  }

  const data = await fetchFn();

  try {
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch {
    // Redis down — data is still returned, just not cached
  }

  return data;
}

/**
 * Invalidate cache entries matching a pattern
 * @param {string} pattern - Redis key pattern (e.g., 'dashboard:*')
 */
async function invalidate(pattern) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  } catch {
    // Redis down — skip invalidation
  }
}

/**
 * Delete a specific cache key
 * @param {string} key - Exact Redis key
 */
async function del(key) {
  try {
    await redis.del(key);
  } catch {
    // Redis down — skip
  }
}

module.exports = { getOrSet, invalidate, del };
