// src/routes/adminRoutes.js
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { tenantMiddleware } from "../middlewares/tenantMiddleware.js";
import {
  addCandidate,
  listCandidates,
  getPendingStudents,
  approveStudent,
  rejectStudent,
} from "../controllers/adminController.js";

const router = express.Router();

// CANDIDATES
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

// STUDENT APPROVAL
router.get(
  "/students/pending",
  authMiddleware,
  roleMiddleware("ORG_ADMIN"),
  tenantMiddleware,
  getPendingStudents
);

router.post(
  "/students/:id/approve",
  authMiddleware,
  roleMiddleware("ORG_ADMIN"),
  tenantMiddleware,
  approveStudent
);

router.post(
  "/students/:id/reject",
  authMiddleware,
  roleMiddleware("ORG_ADMIN"),
  tenantMiddleware,
  rejectStudent
);

export default router;
