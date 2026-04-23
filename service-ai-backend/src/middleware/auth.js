// service-ai-backend/src/config/redis.js
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

// service-ai-backend/src/middleware/auth.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({ error: "Server misconfiguration: JWT_SECRET not set" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

// service-ai-backend/src/config/prisma.js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = {
  async connectToDatabase() {
    try {
      await prisma.$connect();
      return prisma;
    } catch (err) {
      console.error("Error connecting to database", err);
      process.exit(1);
    }
  },

  async disconnectFromDatabase() {
    try {
      await prisma.$disconnect();
    } catch (err) {
      console.error("Error disconnecting from database", err);
    }
  },
};

// service-ai-backend/src/db.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const prisma = require("./config/prisma");

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
})
  .then(() => {
    console.log("MongoDB connection established");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

module.exports = {
  mongoose,
  prisma,
};

// service-ai-backend/src/app.js
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger.json");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const prRoutes = require("./routes/pr.routes");
const githubWebhookRoutes = require("./routes/githubWebhook.routes");
const webhookRoutes = require("./routes/webhook.routes");
const app = express();

app.use(
  express.json({
    limit: "50mb",
  })
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

const { connectToDatabase } = require("./config/prisma");
const { mongoose, prisma } = require("./db");

connectToDatabase()
  .then(() => {
    console.log("MongoDB and Prisma connections established");
    app.listen(3001, () => {
      console.log("Server started on port 3001");
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

// service-ai-backend/src/controllers/auth.controller.js
const express = require("express");
const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");
const prisma = require("../config/prisma");
const redis = require("../config/redis");
const logger = require("../utils/logger");
const { sendOTP } = require("../services/otp.service");

const authController = express.Router();

authController.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(409).json({ error: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (!hashedPassword) {
      return res.status(500).json({ error: "Failed to hash password" });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const OTP = nanoid(6);

    if (!OTP) {
      return res.status(500).json({ error: "Failed to generate OTP" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        OTP,
      },
    });

    await sendOTP(OTP, email);

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = authController;