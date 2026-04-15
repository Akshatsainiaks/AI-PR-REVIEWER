require("dotenv").config();

const http = require("http");
const app = require("./app"); // ✅ IMPORTANT
const redis = require("./config/redis");
const PORT = process.env.PORT || 3000;


const server = http.createServer(app);

redis.set("ping", "pong");
redis.get("ping").then(console.log);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});