// src/config/db.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import winston from "winston";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error("MONGO_URI not set in .env");
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  transports: [new winston.transports.Console()],
});

export async function connectMasterDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: "votex_master",
      // recommended options (Mongoose 7+ uses good defaults)
      autoIndex: true,
    });
    logger.info("Connected to master MongoDB");
    return mongoose.connection;
  } catch (err) {
    logger.error("Master DB connection failed:", err);
    throw err;
  }
}
