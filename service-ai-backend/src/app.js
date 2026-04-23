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
    origin: [
      "http://localhost:3001",
      "https://revuzenai.site",
      "https://www.revuzenai.site"
    ],
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