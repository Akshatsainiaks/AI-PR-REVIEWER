// service-ai-client/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3001,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
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
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const prRoutes = require("./routes/pr.routes");
const webhookRoutes = require("./routes/webhook.routes");
const githubWebhookRoutes = require("./routes/githubWebhook.routes");

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3001",
  credentials: true,
}));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pr', prRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/webhooks', githubWebhookRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
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

redis.on("connect", () => {
  console.log("Redis connected 🚀");
});

redis.on("error", () => {
  console.error("Redis error ❌");
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
  const { email, password, fullName, name, firstName, lastName } = req.body;
  logger.info("📝 Register attempt", { email });

  const finalName = fullName ||
    name ||
    `${firstName || ""} ${lastName || ""}`;

  const hashPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashPassword,
    },
  });

  const otp = nanoid(6);
  redis.set(`otp:${user.id}`, otp, "EX", 300);

  const message = `Hello, your OTP is: ${otp}`;
  await sendOTP(user.email, message);

  res.status(201).json(user);
}