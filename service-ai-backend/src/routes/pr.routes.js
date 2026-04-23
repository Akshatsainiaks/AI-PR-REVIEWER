const express = require("express");
const router = express.Router();

const { analyzePR } = require("../controllers/pr.controller");
const auth = require("../middleware/auth");
const prisma = require("../config/prisma");
const logger = require("../utils/logger");

// Graceful import of broadcastStep — won't crash if socket not yet initialised
let broadcastStep;
try {
  broadcastStep = require("../services/socket.service").broadcastStep;
} catch {
  broadcastStep = () => {};
}

/**
 * @swagger
 * tags:
 *   - name: PR
 *     description: PR Analysis APIs
 */

/**
 * @swagger
 * /pr/analyze:
 *   post:
 *     summary: Trigger AI analysis for a PR
 *     tags: [PR]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prUrl
 *             properties:
 *               prUrl:
 *                 type: string
 *                 example: https://github.com/Akshatsainiaks/AI-PR-REVIEWER/pull/7
 *               baseBranch:
 *                 type: string
 *                 example: main
 *               headBranch:
 *                 type: string
 *                 example: feature/my-branch
 *     responses:
 *       200:
 *         description: Analysis started
 */
router.post("/analyze", auth, analyzePR);

/**
 * @swagger
 * /pr/{prId}/stop:
 *   post:
 *     summary: Stop an ongoing PR analysis
 *     description: Marks the PR job and all running/pending step logs as failed. Broadcasts a stop event via Socket.IO so the frontend updates instantly.
 *     tags: [PR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: prId
 *         required: true
 *         schema:
 *           type: string
 *         description: PR Job ID
 *     responses:
 *       200:
 *         description: Analysis stopped
 *         content:
 *           application/json:
 *             example:
 *               message: Analysis stopped successfully
 *               prId: cmo9j8wpf0005ehvb9aa5nmn3
 *               status: failed
 *       400:
 *         description: PR is not currently analyzing
 *       404:
 *         description: PR not found or you don't have access
 *       500:
 *         description: Server error
 */
router.post("/:prId/stop", auth, async (req, res) => {
  try {
    const { prId } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const pr = await prisma.prJob.findFirst({
      where: { id: prId, userId },
    });

    if (!pr) {
      return res.status(404).json({ error: "PR not found or you don't have access" });
    }

    if (pr.status !== "analyzing") {
      return res.status(400).json({
        error: `Cannot stop — current status is '${pr.status}', must be 'analyzing'`,
      });
    }

    // Mark job as failed
    await prisma.prJob.update({
      where: { id: prId },
      data: { status: "failed" },
    });

    // Mark all running/pending step logs as failed
    await prisma.stepLog.updateMany({
      where: {
        prId,
        status: { in: ["running", "pending"] },
      },
      data: {
        status: "failed",
        details: "Stopped by user",
      },
    });

    // Broadcast stop via Socket.IO so React updates immediately
    try {
      broadcastStep(prId, "stopped", "failed", "Analysis stopped by user");
    } catch (socketErr) {
      logger.warn("⚠️ Could not broadcast stop event", socketErr?.message);
    }

    logger.info("🛑 PR analysis stopped by user", { prId, userId });

    res.json({
      message: "Analysis stopped successfully",
      prId,
      status: "failed",
    });
  } catch (err) {
    logger.error("🔥 Stop PR error", err);
    res.status(500).json({ error: "Failed to stop analysis. Please try again." });
  }
});

/**
 * @swagger
 * /pr:
 *   get:
 *     summary: Get all PRs for logged-in user
 *     tags: [PR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [analyzing, completed, failed]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of PRs with pagination
 */
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const status = req.query.status || null;
    const skip = (page - 1) * limit;

    const where = { userId };
    if (status) where.status = status;

    const [prs, total] = await Promise.all([
      prisma.prJob.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          stepLogs: {
            orderBy: { createdAt: "asc" },
          },
        },
      }),
      prisma.prJob.count({ where }),
    ]);

    res.json({
      data: prs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    logger.error("🔥 Get PRs error", err);
    res.status(500).json({ error: "Failed to fetch PRs" });
  }
});

/**
 * @swagger
 * /pr/{prId}:
 *   get:
 *     summary: Get single PR with all step details
 *     tags: [PR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: prId
 *         required: true
 *         schema:
 *           type: string
 *         description: PR Job ID
 *     responses:
 *       200:
 *         description: PR with steps
 *       404:
 *         description: PR not found
 */
router.get("/:prId", auth, async (req, res) => {
  try {
    const { prId } = req.params;
    const userId = req.user.id;

    const pr = await prisma.prJob.findFirst({
      where: { id: prId, userId },
      include: {
        stepLogs: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!pr) {
      return res.status(404).json({ error: "PR not found" });
    }

    res.json({ data: pr });
  } catch (err) {
    logger.error("🔥 Get PR error", err);
    res.status(500).json({ error: "Failed to fetch PR" });
  }
});

/**
 * @swagger
 * /pr/{prId}/status:
 *   get:
 *     summary: Get PR step status only (lightweight)
 *     tags: [PR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: prId
 *         required: true
 *         schema:
 *           type: string
 *         description: PR Job ID
 *     responses:
 *       200:
 *         description: Step status fetched
 */
router.get("/:prId/status", auth, async (req, res) => {
  try {
    const { prId } = req.params;

    const steps = await prisma.stepLog.findMany({
      where: { prId },
      orderBy: { createdAt: "asc" },
    });

    res.json({ prId, steps });
  } catch (err) {
    logger.error("🔥 Status error", err);
    res.status(500).json({ error: "Failed to fetch status" });
  }
});

module.exports = router;