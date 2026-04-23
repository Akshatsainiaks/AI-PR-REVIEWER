const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const { globalLimiter } = require("./utils/rateLimit");
const errorHandler = require("./utils/errorHandler");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const prRoutes = require("./routes/pr.routes");
const webhookRoutes = require("./routes/webhook.routes");
const githubWebhookRoutes = require("./routes/githubWebhook.routes");
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
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:3001",
        "https://revuzenai.site",
        "https://www.revuzenai.site"
      ];
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      // Allow explicitly defined origins
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      // Allow all vercel preview deployments
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);


app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/pr", prRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/webhooks", githubWebhookRoutes);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.get("/api/docs.json", (req, res) => {
  res.json(swaggerSpec);
});


app.get("/", (req, res) => {
  res.send("API running 🚀");
});


app.use(errorHandler);

module.exports = app;