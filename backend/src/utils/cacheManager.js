/**
 * Redis-Ready Enterprise Caching Abstraction Layer
 * Eliminates repetitive database queries for high-frequency storefront reads (Categories, SubCategories, Filters, Navmenus).
 * Easily configurable to swap to Redis when REDIS_URL or cluster scaling is activated in production environments.
 */
const memoryCache = new Map();

class CacheManager {
  constructor() {
    this.useRedis = !!process.env.REDIS_URL;
    this.defaultTTL = 600; // 10 minutes default
  }

  /**
   * Get cached data by key
   * @param {string} key 
   */
  async get(key) {
    if (this.useRedis && this.redisClient) {
      try {
        const data = await this.redisClient.get(key);
        return data ? JSON.parse(data) : null;
      } catch (err) {
        console.warn('[CacheManager] Redis error on GET, falling back to memory:', err.message);
      }
    }

    const item = memoryCache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      memoryCache.delete(key);
      return null;
    }
    return item.value;
  }

  /**
   * Set cached data with expiration TTL in seconds
   * @param {string} key 
   * @param {any} value 
   * @param {number} ttlSeconds 
   */
  async set(key, value, ttlSeconds = this.defaultTTL) {
    if (value === undefined || value === null) return;

    if (this.useRedis && this.redisClient) {
      try {
        await this.redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        return;
      } catch (err) {
        console.warn('[CacheManager] Redis error on SET, writing to memory cache:', err.message);
      }
    }

    memoryCache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Delete specific key from cache
   * @param {string} key 
   */
  async del(key) {
    if (this.useRedis && this.redisClient) {
      await this.redisClient.del(key);
    }
    memoryCache.delete(key);
  }

  /**
   * Invalidate all keys matching a specific prefix or regex pattern (e.g. 'categories:*', 'filters:*')
   * @param {string} pattern 
   */
  async clearPattern(pattern) {
    const cleanPattern = pattern.replace(/\*/g, '');
    if (this.useRedis && this.redisClient) {
      try {
        const keys = await this.redisClient.keys(`*${cleanPattern}*`);
        if (keys.length > 0) await this.redisClient.del(keys);
        return;
      } catch (e) {
        console.error('[CacheManager] Redis clearPattern error:', e);
      }
    }

    for (const key of memoryCache.keys()) {
      if (key.includes(cleanPattern)) {
        memoryCache.delete(key);
      }
    }
    console.log(`[CacheManager] Invalidated memory cache matching pattern: [${pattern}]`);
  }

  /**
   * Helper to wrap any async DB operation with automated get/set caching
   */
  async wrap(key, ttlSeconds, fetchFn) {
    const cached = await this.get(key);
    if (cached) {
      return cached;
    }
    const data = await fetchFn();
    if (data !== null && data !== undefined) {
      await this.set(key, data, ttlSeconds);
    }
    return data;
  }
}

const cacheManager = new CacheManager();
module.exports = cacheManager;
