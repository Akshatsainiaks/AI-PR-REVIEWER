const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");
const prisma = require("../config/prisma");
const redis = require("../config/redis");
//  REGISTER
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // check user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await prisma.user.create({
      data: {
        id: "usr_" + nanoid(10),
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: 2,
      },
    });

    res.json({
      message: "User registered",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

//  LOGIN

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 🔥 SAFE REDIS STORAGE
    const sessionData = {
      id: user.id,
      email: user.email,
      name: user.firstName,
      role: user.role,
      token,
    };

    await redis.set(
      `session:${user.id}`,
      JSON.stringify(sessionData),
      "EX",
      86400 // 1 day
    );

    // ❗ remove password before response
    delete user.password;

   res.json({
  message: "Login successful",
  token,
  user: {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
  },
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// // 🔹 EXPORT USERS (for admin use)
// exports._users = users;