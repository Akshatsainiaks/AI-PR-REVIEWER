// service-ai-client/src/main.jsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/index.js";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>
);
```

```javascript
// service-ai-backend/prisma/schema.prisma

datasource db {
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
```

```javascript
// service-ai-backend/src/app.js

const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger.json");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const prRoutes = require("./routes/pr.routes");
const webhookRoutes = require("./routes/webhook.routes");
const githubWebhookRoutes = require("./routes/githubWebhook.routes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3001",
  credentials: true
}));
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/pr", prRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/webhooks", githubWebhookRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

```javascript
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

if (process.env.REDIS_PASSWORD) {
  redis.auth(process.env.REDIS_PASSWORD);
}

redis.on("connect", () => {
  console.log("Redis connected 🚀");
});

redis.on("error", (err) => {
  console.error("Redis error ❌", err);
});

module.exports = redis;
```

```javascript
// service-ai-backend/src/controllers/auth.controller.js

const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");
const prisma = require("../config/prisma");
const redis = require("../config/redis");
const logger = require("../utils/logger");
const { sendOTP } = require("../services/otp.service");

exports.register = async (req, res) => {
  const { fullName, firstName, lastName, email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email: email } });

  if (user) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const otp = await sendOTP(email);

  const userObj = await prisma.user.create({
    data: {
      fullName,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 0,
    },
  });

  await redis.set(`otp:${email}`, otp, 'EX', 60);

  logger.info("📝 Register attempt", { email });

  res.status(201).json({
    message: "User created successfully",
    otp,
    user: userObj,
  });
};