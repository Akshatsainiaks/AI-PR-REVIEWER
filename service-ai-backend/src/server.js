require("dotenv").config();

const http = require("http");
const app = require("./app");
const redis = require("./config/redis");
const prisma = require("./config/prisma");
const axios = require("axios");
const { initSocket } = require("./services/socket.service");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

initSocket(server);

const checkDatabase = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info("  ✅ [DATABASE]   Connected successfully");
  } catch (err) {
    logger.error(`  ❌ [DATABASE]   Connection failed — ${err.message}`);
  }
};

const checkRedis = async () => {
  try {
    await redis.set("ping", "pong");
    const value = await redis.get("ping");
    if (value === "pong") {
      logger.info("  ✅ [REDIS]      Connected successfully");
    } else {
      logger.error("  ❌ [REDIS]      Ping failed — unexpected response value");
    }
  } catch (err) {
    logger.error(`  ❌ [REDIS]      Connection failed — ${err.message}`);
  }
};

const checkFastAPI = async () => {
  const fastApiUrl = process.env.FASTAPI_URL;

  if (!fastApiUrl) {
    logger.info("  ⚠️  [FASTAPI]    FASTAPI_URL not set in .env — skipping check");
    return;
  }

  try {
    const res = await axios.get(`${fastApiUrl}/health`, { timeout: 3000 });
    if (res.status === 200) {
      logger.info(`  ✅ [FASTAPI]    Connected at ${fastApiUrl}`);
    } else {
      logger.info(`  ⚠️  [FASTAPI]    Reachable but responded with status ${res.status}`);
    }
  } catch (err) {
    const reason =
      err.code === "ECONNREFUSED"
        ? "service is not running"
        : err.code === "ETIMEDOUT"
        ? "connection timed out"
        : err.code === "ENOTFOUND"
        ? "host not found — check FASTAPI_URL in .env"
        : err.message;

    logger.info(`  ⚠️  [FASTAPI]    Not reachable at ${fastApiUrl} — ${reason}`);
  }
};

const checkFrontend = () => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  logger.info(`  ✅ [FRONTEND]   Expected at ${frontendUrl}`);
};

const startupChecks = async () => {
  const env = process.env.NODE_ENV || "development";

  logger.info("");
  logger.info("  ╔══════════════════════════════════════════════╗");
  logger.info("  ║         AI PR REVIEWER — Main Service        ║");
  logger.info("  ╚══════════════════════════════════════════════╝");
  logger.info(`  Environment  : ${env}`);
  logger.info(`  Port         : ${PORT}`);
  logger.info(`  Started at   : ${new Date().toISOString()}`);
  logger.info("  ──────────────────────────────────────────────");
  logger.info("  Running startup checks...");
  logger.info("  ──────────────────────────────────────────────");

  await checkDatabase();
  await checkRedis();
  await checkFastAPI();
  checkFrontend();

  logger.info("  ──────────────────────────────────────────────");
  logger.info("  Server ready — listening for requests");
  logger.info("  ╔══════════════════════════════════════════════╗");
  logger.info(`  ║   http://localhost:${PORT}/api/docs              ║`);
  logger.info("  ╚══════════════════════════════════════════════╝");
  logger.info("");
};

server.listen(PORT, async () => {
  await startupChecks();
});