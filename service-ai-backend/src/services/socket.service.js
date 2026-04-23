let io;

const initSocket = (server) => {
  const { Server } = require("socket.io");
  const cors = require('cors');

  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3001",
      credentials: true,
      allowedHeaders: cors.allowedHeaders,
      exposedHeaders: cors.exposedHeaders,
      methods: cors.methods,
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

const broadcastStepLog = (prId, step, status, details) => {
  if (!io) return;

  io.to(`pr:${prId}`).emit("pr:stepLog", {
    step,
    status,
    details,
    timestamp: Date.now(),
  });

  console.log("📢 Broadcast:", step, status);
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

module.exports = { initSocket, broadcastStep, broadcastStepLog };