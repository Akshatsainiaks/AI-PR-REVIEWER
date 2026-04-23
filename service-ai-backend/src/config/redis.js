// service-ai-backend/src/config/redis.js

const Redis = require("ioredis");
require("dotenv").config();

const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_TLS === "true" ? { rejectUnauthorized: false } : undefined,
};

if (process.env.REDIS_PASSWORD) {
  redisConfig.password = process.env.REDIS_PASSWORD;
}

if (process.env.REDIS_TLS === "true") {
  redisConfig.tls = { rejectUnauthorized: false };
}

const redis = new Redis(redisConfig);

redis.on("connect", () => {
  console.log("Redis connected 🚀");
});

redis.on("error", (err) => {
  console.error("Redis error ❌", err);
});

module.exports = redis;