const express = require("express");
const router = express.Router();

const { agentWebhook } = require("../controllers/webhook.controller");
const verifyWebhook = require("../middleware/webhookAuth");

/**
 * @swagger
 * tags:
 *   - name: Webhook
 *     description: Secure AI Agent Webhook APIs
 */

/**
 * @swagger
 * /webhooks/agent:
 *   post:
 *     summary: Receive step updates from AI agent (HMAC secured)
 *     tags: [Webhook]
 *     description: |
 *       This endpoint receives step updates from the AI service.
 *       It is protected using HMAC SHA256 signature validation.
 *     parameters:
 *       - in: header
 *         name: x-signature
 *         required: true
 *         schema:
 *           type: string
 *         description: HMAC SHA256 signature generated using WEBHOOK_SECRET
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prId
 *               - step
 *               - status
 *             properties:
 *               prId:
 *                 type: string
 *                 example: cmo1okywp0006xgvbjrui9f9f
 *               step:
 *                 type: string
 *                 example: fetch_pr
 *               status:
 *                 type: string
 *                 example: running
 *               details:
 *                 type: string
 *                 example: Fetching PR data
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Invalid or missing signature
 *       500:
 *         description: Server error
 */
router.post("/agent", verifyWebhook, agentWebhook);

module.exports = router;