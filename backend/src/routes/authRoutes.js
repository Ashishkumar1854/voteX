// src/routes/authRoutes.js
import express from "express";
import {
  registerSuperAdmin,
  login,
  applyOrganization,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register-superadmin", registerSuperAdmin);
router.post("/login", login);
router.post("/apply-org", applyOrganization);

export default router;
