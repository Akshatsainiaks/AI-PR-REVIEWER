const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");
const prisma = require("../config/prisma");
const redis = require("../config/redis");
const logger = require("../utils/logger"); 


exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    logger.info("📝 Register attempt", { email });


    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Password must be 8+ chars, include 1 uppercase, 1 number, 1 special character",
      });
    }


    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logger.warn("⚠️ User already exists", { email });
      return res.status(400).json({ error: "User already exists" });
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const user = await prisma.user.create({
      data: {
        id: "usr_" + nanoid(10),
        fullName,
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

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    logger.info("🔑 Login attempt", { email });


    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      logger.warn("❌ User not found", { email });
      return res.status(401).json({ error: "User not found" });
    }

  
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      logger.warn("❌ Invalid password", { email });
      return res.status(401).json({ error: "Invalid password" });
    }


    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );


    const sessionData = {
      id: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role,
      token,
    };

    await redis.set(
      `session:${user.id}`,
      JSON.stringify(sessionData),
      "EX",
      86400
    );

    logger.info("✅ Login successful", { userId: user.id });


    delete user.password;

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    });

  } catch (err) {
    logger.error("🔥 Login error", err);
    res.status(500).json({ error: "Server error" });
  }
};