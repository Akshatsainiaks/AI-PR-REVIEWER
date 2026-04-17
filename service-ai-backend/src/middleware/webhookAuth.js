const crypto = require("crypto");

module.exports = (req, res, next) => {
  try {
    const signature = req.headers["x-signature"];

    if (!signature) {
      return res.status(401).json({ error: "Missing signature" });
    }

const secret = process.env.GITHUB_WEBHOOK_SECRET;

    if (!req.rawBody) {
      return res.status(400).json({ error: "Raw body not available" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(req.rawBody) // ✅ CRITICAL FIX
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    console.log("🔐 Webhook verified");

    next();

  } catch (err) {
    console.error("Webhook auth error:", err);
    res.status(500).json({ error: "Auth failed" });
  }
};

