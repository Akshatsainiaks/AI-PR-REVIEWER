const prisma = require("../config/prisma");
const { broadcastStep } = require("../services/socket.service");
const logger = require("../utils/logger");

exports.agentWebhook = async (req, res) => {
  try {
    const { prId, step, status, details } = req.body;

    logger.info("📡 Webhook received", { prId, step, status });

    if (!prId || !step || !status) {
      return res.status(400).json({ error: "Missing fields" });
    }


    await prisma.stepLog.updateMany({
      where: { prId, step },
      data: { status, details },
    });

    logger.info("✅ Step updated", { step, status });


    const nextStepMap = {
      fetch_pr: "clone_repo",
      clone_repo: "analyze_code",
      analyze_code: "generate_review",
    };

    if (status === "completed") {
      const nextStep = nextStepMap[step];

      if (nextStep) {
        await prisma.stepLog.updateMany({
          where: { prId, step: nextStep },
          data: { status: "running" },
        });

        logger.info("▶️ Next step started", { nextStep });
      }
    }


    if (step === "generate_review" && status === "completed") {
      await prisma.prJob.update({
        where: { id: prId },
        data: { status: "completed" },
      });

      logger.info("🎉 PR completed", { prId });
    }

    if (status === "failed") {
      await prisma.prJob.update({
        where: { id: prId },
        data: { status: "failed" },
      });

      logger.error("❌ PR failed", { prId, step });
    }


    broadcastStep(prId, step, status, details);

    logger.info("📢 Step broadcasted", { step, status });

    res.json({ message: "Webhook processed" });

  } catch (err) {
    logger.error("🔥 WEBHOOK ERROR", err);
    res.status(500).json({ error: "Webhook error" });
  }
};