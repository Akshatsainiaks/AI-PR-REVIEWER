const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const prisma = require("../config/prisma");
const axios = require("axios");
const { nanoid } = require("nanoid");
const logger = require("../utils/logger");

const verifyGitHubSignature = (req, res, next) => {
  try {
    const sig = req.headers["x-hub-signature-256"];

    if (!sig) {
      return res.status(401).json({ error: "Missing GitHub signature" });
    }

    const secret = process.env.GITHUB_WEBHOOK_SECRET;

    if (!secret) {
      return res.status(500).json({ error: "Webhook secret not configured" });
    }

    if (!req.rawBody) {
      return res.status(400).json({ error: "Raw body not available" });
    }

    const expected =
      "sha256=" +
      crypto
        .createHmac("sha256", secret)
        .update(req.rawBody)
        .digest("hex");

    // Timing-safe compare
    const sigBuffer = Buffer.from(sig.slice(8));
    const expBuffer = Buffer.from(expected.slice(8));

    if (
      sigBuffer.length !== expBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expBuffer)
    ) {
      logger.warn("GitHub webhook signature mismatch");
      return res.status(401).json({ error: "Invalid signature" });
    }

    next();
  } catch (err) {
    logger.error("GitHub webhook auth error", err);
    res.status(500).json({ error: "Auth failed" });
  }
};

router.post(
  "/github",
  verifyGitHubSignature,
  async (req, res) => {
    try {
      const event = req.headers["x-github-event"];

      // Only handle pull_request events
      if (event !== "pull_request") {
        return res.json({ skipped: true, reason: `event=${event}` });
      }

      const { action, pull_request, repository } = req.body;

      if (!["opened", "synchronize"].includes(action)) {
        return res.json({ skipped: true, reason: `action=${action}` });
      }

      const prUrl = pull_request.html_url;
      const prNumber = pull_request.number;
      const repo = repository.full_name;
      const branch = pull_request.head.ref;
      const base = pull_request.base.ref;

      logger.info("GitHub PR webhook received", { repo, prNumber, action });

      const userId = "github_webhook";

      const pr = await prisma.prJob.create({
        data: {
          prUrl,
          status: "analyzing",
          userId,
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

      const fastApiUrl = process.env.FASTAPI_URL;

      if (fastApiUrl) {
        axios
          .post(`${fastApiUrl}/agent/analyze`, {
            pr_id: prNumber,
            repo,
            branch,
            base,
            meta: {
              prId: pr.id,
              pr_url: prUrl,
            },
          })
          .then(() =>
            logger.info("FastAPI triggered from GitHub webhook", { prId: pr.id })
          )
          .catch((err) =>
            logger.error("FastAPI call failed from GitHub webhook", err.message)
          );
      } else {
        logger.warn("FASTAPI_URL not set — skipping AI trigger");
      }

      res.json({ received: true, prId: pr.id });
    } catch (err) {
      logger.error("GitHub webhook error", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;