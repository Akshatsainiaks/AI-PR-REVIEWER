**service-ai-client/README.md**

```markdown
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
```

**service-ai-backend/prisma/schema.prisma**

```prisma
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

**service-ai-backend/src/app.js**

```javascript
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const path = require("path");
const connectRedis = require("connect-redis")(session);
const Redis = require("ioredis");
require("dotenv").config();

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

app.use(session({
  store: connectRedis({
    client: Redis,
  }),
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
  },
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/pr", prRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/webhooks", githubWebhookRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

**service-ai-backend/src/config/redis.js**

```javascript
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

**service-ai-backend/src/controllers/auth.controller.js**

```javascript
const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");
const prisma = require("../config/prisma");
const redis = require("../config/redis");
const logger = require("../utils/logger");
const { sendOTP } = require("../services/otp.service");

exports.register = async (req, res) => {
  logger.info("Register attempt", { email: req.body.email });

  const finalName = req.body.fullName ||
    req.body.name ||
    `${req.body.firstName || ""} ${req.body.lastName || ""}`;

  if (!finalName || !req.body.email || !req.body.password) {
    return res.status(422).send("Invalid request");
  }

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    const user = await prisma.user.create({
      data: {
        fullName: finalName,
        email: req.body.email,
        password: hashedPassword,
        role: 0,
      },
    });

    const OTP = await sendOTP(user.email, nanoid());
    logger.info(" Registered user", { id: user.id });

    return res.status(201).send({ id: user.id, OTP });
  } catch (error) {
    logger.error("Error registering user", { error });
    return res.status(500).send({ error });
  }
};