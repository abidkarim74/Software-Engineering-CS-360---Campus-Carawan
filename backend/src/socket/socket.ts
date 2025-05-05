import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["https://campus-carawan-lums.up.railway.app"],
    methods: ["GET", "POST", "OPTIONS"],

  },
});

const userSocketMap: { [key: string]: string } = {}; 

export const getReceiverSocketId = (receiverId: string ) => {
  return userSocketMap[receiverId] || null;
};

io.on("connection", (socket) => {
  console.log(`🔵 User Connected: ${socket.id}`);

  const userId = socket.handshake.query.userId as string;

  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`✅ User ${userId} mapped to socket ${socket.id}`);
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log(`🔴 User Disconnected: ${socket.id}`);

    if (userId && userSocketMap[userId]) {
      delete userSocketMap[userId];
      console.log(`❌ Removed user ${userId} from socket mapping.`);
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
