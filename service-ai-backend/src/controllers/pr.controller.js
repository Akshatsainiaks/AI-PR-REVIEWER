const prisma = require("../config/prisma");
const axios = require("axios");
const logger = require("../utils/logger");
const { broadcastStep } = require("../services/socket.service");

exports.analyzePR = async (req, res) => {
  try {
    logger.info("🔵 PR Analyze API called");

    const { prUrl, baseBranch = "main", headBranch = "main" } = req.body;
    const userId = req.user.id;

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
    broadcastStep(pr.id, "fetch_pr", "running", "Initiated GitHub fetch");

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

    // Return early so the dashboard navigates instantly
    res.json({
      message: "PR analysis triggered",
      prId: pr.id,
      status: "processing",
    });

    // Run the long FastAPI process in the background
    axios.post(`${fastApiUrl}/agent/fix-and-merge`, payload)
      .then(async (response) => {
        const aiResponse = response.data;
        logger.info("✅ FastAPI success", aiResponse);

        for (const step of steps) {
          await prisma.stepLog.updateMany({
            where: { prId: pr.id, step },
            data: { status: "completed" },
          });
          broadcastStep(pr.id, step, "completed", "Done");
        }

        await prisma.prJob.update({
          where: { id: pr.id },
          data: { 
            status: "completed",
            analysis: aiResponse || null
          },
        });
      })
      .catch(async (apiErr) => {
        logger.error("⚠️ FastAPI error", apiErr.response?.data || apiErr.message);

        await prisma.stepLog.updateMany({
          where: { prId: pr.id, step: "fetch_pr" },
          data: { status: "failed", details: "Failed connecting to backend AI" },
        });
        broadcastStep(pr.id, "fetch_pr", "failed", "AI Service Error");

        await prisma.prJob.update({
          where: { id: pr.id },
          data: { status: "failed" },
        });
      });

  } catch (err) {
    logger.error("🔥 PR Analyze ERROR", err);
    res.status(500).json({ error: "Server error" });
  }
};