const prisma = require("../config/prisma");
const axios = require("axios");

exports.analyzePR = async (req, res) => {
  try {
    console.log("🔵 [START] PR Analyze API called");

    const { prUrl } = req.body;
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

    console.log("🧠 Parsed PR:", { repo, prNumber });


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


    const payload = {
      pr_id: prNumber,
      repo,
      branch: "main",
      base: "main",
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

    } catch (apiErr) {
      console.log("⚠️ FastAPI error:", apiErr.response?.data);

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
    console.error("🔥 ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};