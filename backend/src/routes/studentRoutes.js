// src/routes/studentRoutes.js
import express from "express";
import {
  registerStudent,
  studentLogin,
} from "../controllers/studentController.js";

const router = express.Router();

router.post("/register", registerStudent);
router.post("/login", studentLogin);

export default router;
