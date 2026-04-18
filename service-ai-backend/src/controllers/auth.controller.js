// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
// const { nanoid } = require("nanoid");
// const prisma = require("../config/prisma");
// const redis = require("../config/redis");
// const logger = require("../utils/logger"); 
// const { sendOTP, verifyOTP } = require("../services/otp.service");


// exports.register = async (req, res) => {
//   try {
//   const { fullName, name, firstName, lastName, email, password } = req.body;

// logger.info("📝 Register attempt", { email });

// const finalName =
//   fullName ||
//   name ||
//   `${firstName || ""} ${lastName || ""}`.trim();

// if (!finalName) {
//   return res.status(400).json({ error: "Full name is required" });
// }


//     const passwordRegex =
//       /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

//     if (!passwordRegex.test(password)) {
//       return res.status(400).json({
//         error:
//           "Password must be 8+ chars, include 1 uppercase, 1 number, 1 special character",
//       });
//     }

 
//     const existingUser = await prisma.user.findUnique({
//       where: { email },
//     });

//     if (existingUser) {
//       logger.warn("⚠️ User already exists", { email });
//       return res.status(400).json({ error: "User already exists" });
//     }


//     const hashedPassword = await bcrypt.hash(password, 10);


//     const user = await prisma.user.create({
//       data: {
//         id: "usr_" + nanoid(10),
//         fullName: finalName,
//         email,
//         password: hashedPassword,
//         role: 2,
//       },
//     });

//     logger.info("✅ User registered", { userId: user.id });

//     res.status(201).json({
//       message: "User registered",
//       user: {
//         id: user.id,
//         email: user.email,
//         fullName: user.fullName,
//         role: user.role,
//       },
//     });
//   } catch (err) {
//     logger.error("🔥 Register error", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     logger.info("🔑 Login attempt", { email });


//     const user = await prisma.user.findUnique({
//   where: { email },
// });

// if (!user) {
//   logger.warn("❌ User not found", { email });
//   return res.status(401).json({ error: "User not found" });
// }


// const now = new Date();

// const requireOtp =
//   !user.lastLoginAt ||
//   (now - new Date(user.lastLoginAt)) > 15 * 24 * 60 * 60 * 1000;

// if (requireOtp) {
//   await sendOTP(email);

//   return res.json({
//     message: "OTP required for login",
//     otpRequired: true,
//   });
// }

  
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       logger.warn("❌ Invalid password", { email });
//       return res.status(401).json({ error: "Invalid password" });
//     }


//     const token = jwt.sign(
//       { id: user.id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
//     );


//     const sessionData = {
//       id: user.id,
//       email: user.email,
//       name: user.fullName,
//       role: user.role,
//       token,
//     };

//     await redis.set(
//       `session:${user.id}`,
//       JSON.stringify(sessionData),
//       "EX",
//       86400
//     );

//     logger.info("✅ Login successful", { userId: user.id });


//     delete user.password;

//     res.json({
//       message: "Login successful",
//       token,
//       user: {
//         id: user.id,
//         email: user.email,
//         fullName: user.fullName,
//       },
//     });

//   } catch (err) {
//     logger.error("🔥 Login error", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };




// // ----------------------------OTP------------------------------

// // SEND OTP
// exports.sendOtpController = async (req, res) => {
//   try {
//     const { email } = req.body;

//     await sendOTP(email);

//     res.json({ message: "OTP sent to email" });
//   } catch (err) {
//     logger.error("🔥 OTP send error", err);
//     res.status(500).json({ error: "Failed to send OTP" });
//   }
// };

// // VERIFY OTP
// exports.verifyOtpController = async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     const isValid = await verifyOTP(email, otp);

//     if (!isValid) {
//       return res.status(400).json({ error: "Invalid or expired OTP" });
//     }

//     let user = await prisma.user.findUnique({ where: { email } });

//     // create user if not exists
//     if (!user) {
//       user = await prisma.user.create({
//         data: {
//           id: "usr_" + nanoid(10),
//           fullName: "OTP User",
//           email,
//           password: "otp_login",
//           role: 2,
//         },
//       });
//     }

//     const token = jwt.sign(
//       { id: user.id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
//     );

//    res.json({
//   message: "OTP login successful",
//   token,
//   user: {
//     id: user.id,
//     email: user.email,
//     fullName: user.fullName,
//     role: user.role,
//   },
// });

//   } catch (err) {
//     logger.error("🔥 OTP verify error", err);
//     res.status(500).json({ error: "OTP verification failed" });
//   }
// };


// exports.sendOtpRegister = async (req, res) => {
//   try {
//     const { fullName, email, password } = req.body;

//     const existingUser = await prisma.user.findUnique({ where: { email } });
//     if (existingUser) {
//       return res.status(400).json({ error: "User already exists" });
//     }

//     // store temp user
//     await storeTempUser(email, { fullName, email, password });

//     await sendOTP(email);

//     res.json({ message: "OTP sent for registration" });

//   } catch (err) {
//     res.status(500).json({ error: "Failed" });
//   }
// };

// exports.verifyOtpRegister = async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     const valid = await verifyOTP(email, otp);
//     if (!valid) {
//       return res.status(400).json({ error: "Invalid OTP" });
//     }

//     const tempUser = await getTempUser(email);

//     const hashedPassword = await bcrypt.hash(tempUser.password, 10);

//     const user = await prisma.user.create({
//       data: {
//         id: "usr_" + nanoid(10),
//         fullName: tempUser.fullName,
//         email,
//         password: hashedPassword,
//         role: 2,
//       },
//     });

//     await redis.del(`temp:${email}`);
//     await redis.del(`otp:${email}`);

//     res.json({ message: "Registration successful" });

//   } catch (err) {
//     res.status(500).json({ error: "Failed" });
//   }
// };


// exports.sendOtpLogin = async (req, res) => {
//   const { email } = req.body;

//   const user = await prisma.user.findUnique({ where: { email } });

//   if (!user) {
//     return res.status(404).json({ error: "User not found" });
//   }

//   await sendOTP(email);

//   res.json({ message: "OTP sent for login" });
// };

// exports.verifyOtpLogin = async (req, res) => {
//   const { email, otp } = req.body;

//   const valid = await verifyOTP(email, otp);

//   if (!valid) {
//     return res.status(400).json({ error: "Invalid OTP" });
//   }

//   const user = await prisma.user.findUnique({ where: { email } });

//   const token = jwt.sign(
//     { id: user.id, role: user.role },
//     process.env.JWT_SECRET
//   );

//   await prisma.user.update({
//     where: { id: user.id },
//     data: { lastLoginAt: new Date() },
//   });

//   res.json({
//     token,
//     user: {
//       id: user.id,
//       email: user.email,
//       fullName: user.fullName,
//     },
//   });
// };


const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");
const prisma = require("../config/prisma");
const redis = require("../config/redis");
const logger = require("../utils/logger"); 
const { sendOTP } = require("../services/otp.service");

exports.register = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { fullName, name, firstName, lastName, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    logger.info("📝 Register attempt", { email });

    const finalName =
      fullName ||
      name ||
      `${firstName || ""} ${lastName || ""}`.trim();

    if (!finalName) {
      return res.status(400).json({ error: "Full name is required" });
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Password must be 8+ chars, include uppercase, number, special char",
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

exports.login = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const password = req.body.password?.trim();

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    logger.info("🔑 Login attempt", { email });

    const user = await prisma.user.findUnique({
      where: { email },
    });


    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "24h",
      }
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
      },
    });

  } catch (err) {
    logger.error("🔥 Login error", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: "User not registered" });
    }

    await sendOTP(email);

    res.json({
      message: `OTP sent to ${email}`,
    });

  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
};



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


    if (storedOtp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }


    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

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


    await redis.del(`reset:${email}`);

    res.json({
      message: "Password updated successfully",
      redirect: "/login",
    });

  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
};