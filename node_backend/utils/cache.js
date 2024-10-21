const Redis = require("ioredis");

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

const CACHE_EXPIRATION = 3600;

const getFromCache = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error getting data from Redis:", error);
    return null;
  }
};

const setInCache = async (key, value) => {
  try {
    await redis.set(key, JSON.stringify(value), "EX", CACHE_EXPIRATION);
  } catch (error) {
    console.error("Error setting data in Redis:", error);
  }
};

module.exports = {
  getFromCache,
  setInCache,
};
