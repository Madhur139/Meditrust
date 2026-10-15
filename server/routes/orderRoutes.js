import express from "express";
import orderController from "../controllers/order/orderController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", orderController.getAllOrder);
router.get("/:oid", orderController.getSingleOrder);
router.post("/:pid", protect.forUser, orderController.createOrder);

export default router;
