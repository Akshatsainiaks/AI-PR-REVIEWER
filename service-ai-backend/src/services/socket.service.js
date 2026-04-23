let io;

const initSocket = (server) => {
  const { Server } = require("socket.io");

  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:3001",
        "http://localhost:5173",
        "https://revuzenai.site",
        "https://www.revuzenai.site"
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Client connected:", socket.id);

    socket.on("join:pr", (prId) => {
      socket.join(`pr:${prId}`);
      console.log(`📌 Joined room pr:${prId}`);
    });
  });
};

const broadcastStep = (prId, step, status, details) => {
  if (!io) return;

  io.to(`pr:${prId}`).emit("pr:step", {
    step,
    status,
    details,
    timestamp: Date.now(),
  });

  console.log("📢 Broadcast:", step, status);
};

module.exports = { initSocket, broadcastStep };