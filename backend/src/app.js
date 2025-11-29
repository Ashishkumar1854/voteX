// src/app.js
import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import morgan from "morgan";
import dotenv from "dotenv";
import helmet from "helmet";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import studentRoutes from "./routes/studentRoutes.js"; // 🆕 ADD

dotenv.config();

const app = express();

// Basic security headers
app.use(helmet());

// Logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// File upload
app.use(
  fileUpload({
    createParentPath: true,
    limits: {
      fileSize: Number(process.env.MAX_UPLOAD_SIZE || 5 * 1024 * 1024),
    },
    abortOnLimit: true,
  })
);

// CORS
const allowed = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = allowed.length
  ? {
      origin: (origin, cb) =>
        allowed.includes(origin) || !origin
          ? cb(null, true)
          : cb(new Error("Not allowed")),
    }
  : {};

app.use(cors(corsOptions));

// health route
app.get("/health", (_req, res) =>
  res.json({ status: "ok", env: process.env.NODE_ENV || "development" })
);

// Base path
const base = process.env.API_BASE_PATH || "/api/v1";

// mount routes
app.use(`${base}/auth`, authRoutes);
app.use(`${base}/admin`, adminRoutes);
app.use(`${base}/super-admin`, superAdminRoutes);
app.use(`${base}/students`, studentRoutes); // 🆕 ADD

export default app;
