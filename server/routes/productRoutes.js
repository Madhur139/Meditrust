import express from "express";
import productController from "../controllers/products/productController.js";

const router = express.Router();

router.get("/", productController.getAllProducts);
router.get("/:pid", productController.getSingleProduct);

export default router;
