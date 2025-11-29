// server.js
import http from "http";
import app from "./src/app.js";
import dotenv from "dotenv";
import { connectMasterDB } from "./src/config/db.js";
import { Server as IOServer } from "socket.io";

dotenv.config();

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // Connect master DB (db.js file will export connectMasterDB)
    await connectMasterDB();

    // Create HTTP server and attach Express app
    const server = http.createServer(app);

    // Attach Socket.IO
    const io = new IOServer(server, {
      path: "/socket.io",
      cors: {
        origin: (process.env.ALLOWED_ORIGINS || "")
          .split(",")
          .map((s) => s.trim()),
        credentials: true,
      },
    });

    // Basic socket handlers (will expand in src/socket/socket.js later)
    io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`);
      socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });

    server.listen(PORT, () => {
      console.log(
        `VoteX backend running on port ${PORT} — env: ${process.env.NODE_ENV}`
      );
    });

    // optional export for testing / later modules
    return { server, io };
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
