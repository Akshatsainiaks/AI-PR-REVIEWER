const Redis = require("ioredis");
require("dotenv").config();

const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
};

if (process.env.REDIS_PASSWORD) {
  redisConfig.password = process.env.REDIS_PASSWORD;
}

if (process.env.REDIS_TLS === "true") {
  redisConfig.tls = {};
}

const redis = new Redis(redisConfig);


redis.on("connect", () => {});

redis.on("error", () => {});

module.exports = redis;