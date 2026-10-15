import express from "express";
import upload from "../middleware/fileUploadMiddleware.js";
import protect from "../middleware/authMiddleware.js";
import aiController from "../controllers/ai/aiController.js";

const router = express.Router();

router.post(
  "/prescription",
  protect.forUser,
  upload.single("prescription"),
  aiController.explainPrescription,
);
router.get("/find/:pid", protect.forUser, aiController.findMedicines);
router.get("/chat", protect.forUser, aiController.chatWithAi);

export default router;
