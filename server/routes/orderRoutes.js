import express from "express";
import orderController from "../controllers/order/orderController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my-orders", protect.forUser, orderController.getMyOrders);
router.get("/", protect.forUser, orderController.getAllOrder);
router.get("/:oid", protect.forUser, orderController.getSingleOrder);
router.post("/:pid", protect.forUser, orderController.createOrder);

export default router;
