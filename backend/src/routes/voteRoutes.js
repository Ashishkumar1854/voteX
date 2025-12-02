//📌 src/routes/voteRoutes.js
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { tenantMiddleware } from "../middlewares/tenantMiddleware.js";
import { castVote } from "../controllers/voteController.js";

const router = express.Router();

router.post(
  "/cast",
  authMiddleware,
  roleMiddleware("STUDENT"),
  tenantMiddleware,
  castVote
);

export default router;
