const Redis = require('ioredis');

if (process.env.NODE_ENV === 'test') {
  module.exports = {
    get: async () => null,
    setex: async () => 'OK',
    keys: async () => [],
    del: async () => 0,
    on: () => {},
    quit: async () => 'OK',
    disconnect: () => undefined,
  };
} else {
  const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 200, 2000);
      return delay;
    },
  });

  redis.on('error', (err) => console.error('Redis error:', err.message));
  redis.on('connect', () => console.log('Redis connected'));

  module.exports = redis;
}
