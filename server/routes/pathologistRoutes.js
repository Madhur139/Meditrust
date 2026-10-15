import express from "express";
import pathologistController from "../controllers/pathologist/pathologistController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", pathologistController.getAllPathologists);
router.get("/tests", pathologistController.getAllPathologyTests);
router.get(
  "/appointments",
  protect.forUser,
  pathologistController.getALlAppointments,
);
router.get(
  "/appointments/:aid",
  protect.forUser,
  pathologistController.getAppointment,
);

router.post(
  "/request",
  protect.forUser,
  pathologistController.becomePathologist,
);
router.post("/add", protect.forUser, pathologistController.addPathologyTest);
router.post("/:pid", protect.forUser, pathologistController.bookTest);

router.put(
  "/appointments/:aid",
  protect.forUser,
  pathologistController.updateAppointment,
);

export default router;
