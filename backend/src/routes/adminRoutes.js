// src/routes/adminRoutes.js
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { tenantMiddleware } from "../middlewares/tenantMiddleware.js";
import {
  addCandidate,
  listCandidates,
} from "../controllers/adminController.js";

const router = express.Router();

router.post(
  "/candidates",
  authMiddleware,
  roleMiddleware("ORG_ADMIN"),
  tenantMiddleware,
  addCandidate
);

router.get(
  "/candidates",
  authMiddleware,
  roleMiddleware("ORG_ADMIN"),
  tenantMiddleware,
  listCandidates
);

export default router;
