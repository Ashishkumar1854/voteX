// src/routes/studentRoutes.js
import express from "express";
import { registerStudent } from "../controllers/studentController.js";

const router = express.Router();

// Public route: no auth yet, because student abhi system ke bahar hai
router.post("/register", registerStudent);

export default router;
