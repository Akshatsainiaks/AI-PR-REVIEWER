require("dotenv").config();

const http = require("http");
const app = require("./app");
const redis = require("./config/redis");
const { initSocket } = require("./services/socket.service");

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);


initSocket(server);


(async () => {
  try {
    await redis.set("ping", "pong");
    const value = await redis.get("ping");
    console.log("🧠 Redis test:", value);
  } catch (err) {
    console.error("❌ Redis error:", err);
  }
})();

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});