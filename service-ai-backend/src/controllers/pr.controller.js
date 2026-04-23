const prisma = require("../config/prisma");
const axios = require("axios");
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("../swagger.json");
const logger = require("../utils/logger");

const app = express();
app.use(express.json());

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const prRoutes = require("./routes/pr.routes");
const webhookRoutes = require("./routes/webhook.routes");
const githubWebhookRoutes = require("./routes/githubWebhook.routes");

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

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});

const getUser = async (token) => {
  const headers = {
    Authorization: "Bearer " + token,
  };
  let response;
  try {
    response = await axios.get("http://localhost:3001/api/me", { headers });
  } catch (err) {
    logger.error(err);
  }
  return response.data;
};

exports.analyzePR = async (req, res) => {
  try {
    logger.info("🔵 PR Analyze API called");

    const { prUrl, baseBranch = "main", headBranch = "main" } = req.body;
    const token = req.user.tokens[0].token;

    if (!prUrl) {
      return res.status(400).json({ error: "PR URL required" });
    }

    const fastApiUrl = process.env.FASTAPI_URL;

    if (!fastApiUrl) {
      return res.status(500).json({
        error: "FASTAPI_URL not configured",
      });
    }

    const match = prUrl.match(/github\.com\/(.+?)\/(.+?)\/pull\/(\d+)/);

    if (!match) {
      return res.status(400).json({ error: "Invalid PR URL" });
    }

    const owner = match[1];
    const repoName = match[2];
    const prNumber = parseInt(match[3]);

    const repo = `${owner}/${repoName}`;

    logger.info("🧠 Parsed PR", { repo, prNumber });

    const user = await getUser(token);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const pr = await prisma.prJob.create({
      data: {
        prUrl,
        status: "analyzing",
        userId: user.id,
        repo,
      },
    });

    const steps = ["fetch_pr", "clone_repo", "analyze_code", "generate_review"];

    await prisma.stepLog.createMany({
      data: steps.map((step) => ({
        prId: pr.id,
        step,
        status: "pending",
      })),
    });

    await prisma.stepLog.updateMany({
      where: { prId: pr.id, step: "fetch_pr" },
      data: { status: "running" },
    });

    const payload = {
      pr_id: prNumber,
      repo,
      branch: headBranch,
      base: baseBranch,
      meta: {
        prId: pr.id,
        pr_url: prUrl,
      },
    };

    let aiResponse;

    try {
      const response = await axios.post(
        `${fastApiUrl}/agent/analyze`,
        payload
      );

      aiResponse = response.data;

      logger.info("✅ FastAPI success", aiResponse);

    } catch (apiErr) {
      logger.error("⚠️ FastAPI error", apiErr(response?.data));

      aiResponse = {
        status: "mock",
        message: "AI service connected but GitHub failed",
      };
    }

    res.json({
      message: "PR analysis triggered",
      prId: pr.id,
      status: "processing",
      aiResponse,
    });
  } catch (err) {
    logger.error("🔥 PR Analyze ERROR", err);
    res.status(500).json({ error: "Server error" });
  }
};