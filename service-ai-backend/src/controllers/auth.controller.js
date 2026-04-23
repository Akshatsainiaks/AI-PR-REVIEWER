const jwt = require("jsonwebtoken");
const axios = require("axios");
const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");
const prisma = require("../config/prisma");
const redis = require("../config/redis");
const logger = require("../utils/logger");
const { sendOTP, verifyOTP, resetPassword } = require("../services/otp.service");
const githubWebhookRoutes = require("./routes/githubWebhook.routes");

// ── Register ──────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { fullName, name, firstName, lastName, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    logger.info("📝 Register attempt", { email });

    const finalName =
      fullName || name || `${firstName || ""} ${lastName || ""}`.trim();

    if (!finalName) {
      return res.status(400).json({ error: "Full name is required" });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: "Password must be 8+ chars, include uppercase, number, special char",
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      logger.warn("⚠️ User already exists", { email });
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        id: "usr_" + nanoid(10),
        fullName: finalName,
        email,
        password: hashedPassword,
        role: 2,
      },
    });

    logger.info("✅ User registered", { userId: user.id });

    res.status(201).json({
      message: "User registered",
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (err) {
    logger.error("🔥 Register error", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const password = req.body.password?.trim();

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    logger.info("🔑 Login attempt", { email });

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );

    await redis.set(
      `session:${user.id}`,
      JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role,
        token,
      }),
      "EX",
      86400
    );

    logger.info("✅ Login successful", { userId: user.id });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (err) {
    logger.error("🔥 Login error", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ── Forgot Password ───────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await prisma.user.findUnique({ where: { email } });

    // Don't reveal if user exists — always return same message
    if (!user) {
      return res.json({ message: `OTP sent to ${email}` });
    }

    await sendOTP(email);

    res.json({ message: `OTP sent to ${email}` });
  } catch (err) {
    if (err.message?.includes("60 seconds")) {
      return res.status(429).json({ error: err.message });
    }
    logger.error("🔥 Forgot password error", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

// ── Reset Password ────────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const storedOtp = await redis.get(`reset:${email}`);
    if (!storedOtp) {
      return res.status(400).json({ error: "OTP expired or not requested" });
    }

    // Brute-force protection: max 3 attempts
    const attempts = await redis.get(`otp_attempts:${email}`);
    if (attempts && parseInt(attempts) >= 3) {
      await redis.del(`reset:${email}`);
      await redis.del(`otp_attempts:${email}`);
      return res.status(429).json({ error: "Too many attempts. Please request a new OTP." });
    }

    if (storedOtp !== otp) {
      await redis.incr(`otp_attempts:${email}`);
      await redis.expire(`otp_attempts:${email}`, 300);
      const remaining = 3 - (parseInt(attempts || "0") + 1);
      return res.status(400).json({
        error: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        error: "Password must be 8+ chars, include uppercase, number, special char",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Clean up all OTP keys
    await Promise.all([
      redis.del(`reset:${email}`),
      redis.del(`otp_cooldown:${email}`),
      redis.del(`otp_attempts:${email}`),
    ]);

    logger.info("✅ Password reset successful", { email });
    res.json({
      message: "Password updated successfully. Please login.",
      redirect: "/login",
    });
  } catch (err) {
    logger.error("🔥 Reset password error", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
};

// ── GitHub OAuth ──────────────────────────────────────────────────────────────
exports.githubLogin = (req, res) => {
  const githubURL = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email`;
  res.redirect(githubURL);
};

exports.githubCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=missing_code`);
    }

    // Exchange code for access token
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenRes.data.access_token;

    if (!accessToken) {
      logger.error("GitHub OAuth — no access token", tokenRes.data);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=github_token_failed`);
    }

    // Fetch GitHub profile + emails in parallel
    const [userRes, emailRes] = await Promise.all([
      axios.get("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${