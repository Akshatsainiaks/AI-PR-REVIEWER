const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const prisma = require("../config/prisma");

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  githubCallback,
  githubLogin,
} = require("../controllers/auth.controller");
const { otpLimiter } = require("../utils/rateLimit");

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Akshat Saini
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *               password:
 *                 type: string
 *                 example: Strong@123
 *     responses:
 *       201:
 *         description: User registered
 */
router.post("/register", register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *               password:
 *                 type: string
 *                 example: Strong@123
 *     responses:
 *       200:
 *         description: Login successful — returns token + user (with githubUsername, avatarUrl)
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current logged-in user profile
 *     description: Returns full user object including githubUsername and avatarUrl. Called by OAuthSuccess after GitHub login to get the complete profile.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             example:
 *               user:
 *                 id: usr_abc123
 *                 email: akshat@gmail.com
 *                 fullName: Akshat Saini
 *                 role: 2
 *                 githubUsername: Akshatsainiaks
 *                 avatarUrl: https://avatars.githubusercontent.com/u/12345
 *       401:
 *         description: Not authenticated
 */
router.get("/me", auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        githubUsername: true,
        avatarUrl: true,
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error("GET /auth/me error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Send OTP for password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             example:
 *               message: OTP sent to test@gmail.com
 *       404:
 *         description: User not found
 */
router.post("/forgot-password", otpLimiter, forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: Strong@123
 *               confirmPassword:
 *                 type: string
 *                 example: Strong@123
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             example:
 *               message: Password updated successfully. Please login.
 *               redirect: /login
 *       400:
 *         description: Invalid OTP or validation error
 */
router.post("/reset-password", resetPassword);

/**
 * @swagger
 * /auth/github:
 *   get:
 *     summary: Login with GitHub (OAuth)
 *     tags: [Auth]
 *     description: Redirects user to GitHub for authentication
 *     responses:
 *       302:
 *         description: Redirect to GitHub login
 */
router.get("/github", githubLogin);

/**
 * @swagger
 * /auth/github/callback:
 *   get:
 *     summary: GitHub OAuth callback
 *     tags: [Auth]
 *     description: GitHub redirects here after login. Upserts user with githubUsername + avatarUrl then redirects to /oauth-success?token=...
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code from GitHub
 *     responses:
 *       302:
 *         description: Redirect to frontend with token
 */
router.get("/github/callback", githubCallback);

module.exports = router;