require("dotenv").config();

const express = require("express");
const http = require("http");
const app = express();
const redis = require("./config/redis");
const prisma = require("./config/prisma");
const axios = require("axios");
const { initSocket } = require("./services/socket.service");
const logger = require("./utils/logger");
const swaggerJsDoc = require("swagger-jsdoc");

const PORT = process.env.PORT || 3000;

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "AI PR Reviewer",
      description: "API documentation for AI PR Reviewer",
      contact: {
        name: "Your Name",
      },
      servers: ["http://localhost:3000"],
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3001",
  credentials: true,
};
app.use(cors(corsOptions));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/pr", require("./routes/pr.routes"));
app.use("/api/webhooks", require("./routes/githubWebhook.routes"));
app.use("/api/docs", swaggerSpec);

server.listen(PORT, async () => {
  await startupChecks();
});

// Prisma models
module.exports = {
  User: prisma.model.User,
  PrJob: prisma.model.PrJob,
  StepLog: prisma.model.StepLog,
};