const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const { globalLimiter } = require("./utils/rateLimit");
const errorHandler = require("./utils/errorHandler");

const authRoutes = require("./routes/auth.routes");
const githubWebhookRoutes = require("./routes/githubWebhook.routes");
const adminRoutes = require("./routes/admin.routes");
const prRoutes = require("./routes/pr.routes");
const webhookRoutes = require("./routes/webhook.routes");

const app = express();

app.use(globalLimiter);

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/webhooks/github", githubWebhookRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/pr", prRoutes);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/api/docs.json", (req, res) => {
  res.json(swaggerSpec);
});

app.get("/", (req, res) => {
  res.send("API running 🚀");
});

app.use(errorHandler);

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
const redis = require("ioredis")(redisConfig);

const prismaConfig = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};
const prisma = require("@prisma/client").PrismaClient({
  datasources: prismaConfig,
});
prisma.$connect();

module.exports = app;

// Removed extra code from the controller to meet the requirements