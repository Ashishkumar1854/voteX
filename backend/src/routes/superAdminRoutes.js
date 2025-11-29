// src/routes/superAdminRoutes.js
import express from "express";
import { approveOrg } from "../controllers/superAdminController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post(
  "/approve-org",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  approveOrg
);

export default router;
