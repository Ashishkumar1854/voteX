// src/routes/superAdminRoutes.js
import express from "express";
import { approveOrg } from "../controllers/superAdminController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import User from "../models/master/User.js";
import { hashPassword } from "../services/cryptoService.js";

const router = express.Router();

// Approve Organization
router.post(
  "/approve-org",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  approveOrg
);

// Create Organization Admin Manually
router.post(
  "/create-org-admin",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  async (req, res) => {
    try {
      const { orgCode, name, email, password } = req.body;

      if (!orgCode || !name || !email || !password) {
        return res.status(400).json({ error: "Missing fields" });
      }

      const hashed = await hashPassword(password);

      const admin = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashed,
        role: "ORG_ADMIN",
        orgCode: orgCode.toUpperCase(),
      });

      return res.json({
        message: "Org admin created",
        adminId: admin._id,
      });
    } catch (err) {
      console.error("create-org-admin:", err);
      return res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
