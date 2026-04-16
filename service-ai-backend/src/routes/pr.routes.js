const express = require("express");
const router = express.Router();

const { analyzePR } = require("../controllers/pr.controller");
const auth = require("../middleware/auth");
const prisma = require("../config/prisma");

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
 *     summary: Trigger AI analysis for PR
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
 *     responses:
 *       200:
 *         description: Analysis started
 */
router.post("/analyze", auth, analyzePR);

/**
 * @swagger
 * /pr/{prId}/status:
 *   get:
 *     summary: Get PR step status
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

    res.json({
      prId,
      steps,
    });

  } catch (err) {
    console.error("🔥 Status Error:", err);
    res.status(500).json({ error: "Failed to fetch status" });
  }
});

module.exports = router;