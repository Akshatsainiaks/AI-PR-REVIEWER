const prisma = require("../config/prisma");
const { broadcastStep } = require("../services/socket.service");

exports.agentWebhook = async (req, res) => {
  try {
    const { prId, step, status, details } = req.body;

    if (!prId || !step || !status) {
      return res.status(400).json({ error: "Missing fields" });
    }


    await prisma.stepLog.updateMany({
      where: { prId, step },
      data: { status, details },
    });


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
      }
    }


    if (step === "generate_review" && status === "completed") {
      await prisma.prJob.update({
        where: { id: prId },
        data: { status: "completed" },
      });
    }


    if (status === "failed") {
      await prisma.prJob.update({
        where: { id: prId },
        data: { status: "failed" },
      });
    }


    broadcastStep(prId, step, status, details);

    res.json({ message: "Webhook processed" });

  } catch (err) {
    console.error("🔥 WEBHOOK ERROR:", err);
    res.status(500).json({ error: "Webhook error" });
  }
};