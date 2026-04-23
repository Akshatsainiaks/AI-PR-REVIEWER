// service-ai-client/src/services/socket.js
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_WS_URL, {
  autoConnect: false,
  auth: {
    token: localStorage.getItem("token"),
  },
});

export default socket;
```

```javascript
// service-ai-backend/prisma/schema.prisma
datasource db {
  provider = "sqlite"
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

model StepExecution {
  id            String    @id @default(cuid())
  jobId         String
  stepId        String
  status        String
  details       String?
  createdAt     DateTime  @default(now())
  jobId         PrJob     @relation(fields: [jobId], references: [id])
}

model UserAction {
  id        String   @id @default(cuid())
  timestamp DateTime @default(now())
  userId    String
  action    String
  data      Json
}
```


```javascript
// service-ai-backend/src/app.js
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger.js');
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const prRoutes = require("./routes/pr.routes");
const webhookRoutes = require("./routes/webhook.routes");
const githubWebhookRoutes = require("./routes/githubWebhook.routes");

const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3001",
  credentials: true,
}));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/pr", prRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/webhooks", githubWebhookRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = app;
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

redis.on("connect", () => {});
redis.on("error", () => {});

module.exports = redis;
```


```javascript
// service-ai-backend/src/controllers/auth.controller.js
const express = require('express');
const bcrypt = require('bcrypt');
const { nanoid } = require("nanoid");
const prisma = require('../config/prisma');
const redis = require('../config/redis');
const logger = require('../utils/logger');
const { sendOTP } = require('../services/otp.service');

const register = async (req, res) => {
  try {
    const { name, fullName, email, password } = req.body;
    logger.info('📝 Register attempt', { email });

    const finalName = fullName || name || `${name?.split(' ')[0] || ''}${(name?.split(' ')[1] || '').charAt(0) || ''} ${name?.split(' ')[1] || ''}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      }
    });

    logger.info('📨 User created', { userId: user.id });
    const otp = nanoid(6);
    await prisma.userAction.create({
      data: {
        userId: user.id,
        action: 'OTP_GENERATED',
        data: { otp },
      }
    });
    await redis.set(`user-${user.id}`, otp, 'EX', 300);

    await sendOTP(user.email, otp);
    return res.status(201).json({ message: 'Registration successful. OTP sent to your email!' });
  } catch (error) {
    logger.error('🚨 Error registering user', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};