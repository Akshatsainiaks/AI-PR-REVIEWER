const { _users: users } = require("./auth.controller");

// 🔹 MAKE ADMIN (role = 1)
exports.makeAdmin = (req, res) => {
  const { userId } = req.params;

  // check current user is admin
  if (req.user.role !== 1) {
    return res.status(403).json({ error: "Only admin can promote users" });
  }

  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  user.role = 1; // ✅ type 1 = admin

  res.json({
    message: "User promoted to admin",
    user,
  });
};