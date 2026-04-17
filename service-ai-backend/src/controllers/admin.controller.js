const prisma = require("../config/prisma");
const logger = require("../utils/logger");


exports.makeAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    logger.info("👑 Admin promotion request", { userId });

    if (req.user.role !== 1) {
      logger.warn("❌ Unauthorized admin attempt", {
        requester: req.user.id,
      });
      return res.status(403).json({
        error: "Only admin can promote users",
      });
    }


    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      logger.warn("❌ User not found for promotion", { userId });
      return res.status(404).json({ error: "User not found" });
    }


    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: 1 },
    });

    logger.info("✅ User promoted to admin", { userId });

    res.json({
      message: "User promoted to admin",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });

  } catch (err) {
    logger.error("🔥 Admin promotion error", err);
    res.status(500).json({ error: "Server error" });
  }
};