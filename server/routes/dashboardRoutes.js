import express from "express";
import protect from "../middleware/authMiddleware.js";
import dashboardController from "../controllers/dashboard/dashboardController.js";

const router = express.Router();

router.get("/summary", protect.forUser, dashboardController.getSummary);

export default router;
