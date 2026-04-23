import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import prReducer from "./slices/prSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pr: prReducer,
  },
});

export default store;

// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String    @id
  fullName    String
  email       String    @unique
  password    String
  role        Int
  createdAt   DateTime  @default(now())
  lastLoginAt DateTime?
}

model PrJob {
  id        String     @id @default(cuid())
  prUrl     String
  status    String
  userId    String
  createdAt DateTime   @default(now())
  stepLogs  StepLog[]
}

model StepLog {
  id        String   @id @default(cuid())
  prId      String
  step      String
  status    String
  details   String?
  createdAt DateTime @default(now())
  pr        PrJob    @relation(fields: [prId], references: [id])
}

// app.js
const express = require('express');
const app = express();

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const prRoutes = require("./routes/pr.routes");
const webhookRoutes = require("./routes/webhook.routes");
const githubWebhookRoutes = require("./routes/githubWebhook.routes");

app.use(
  express.json(),
  express.urlencoded({ extended: true })
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/pr", prRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/webhooks", githubWebhookRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// redis.js
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

redis.on("connect", () => {
  console.log("Redis connected 🚀");
});

redis.on("error", (err) => {
  console.error("Redis error ❌", err);
});

module.exports = redis;

// auth.controller.js
const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");
const prisma = require("../config/prisma");
const redis = require("../config/redis");
const logger = require("../utils/logger");
const { sendOTP } = require("../services/otp.service");

exports.register = async (req, res) => {
  // ... [REST OF THE FILE REMAINS UNCHANGED] ...