import Order from "../../models/orderModel.js";
import Product from "../../models/productModel.js";

const createOrder = async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.pid;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(409);
    throw new Error("Product Not Found..");
  }

  const order = await Order.create({ user: userId, product });

  if (!order) {
    res.status(409);
    throw new Error("Order Not Created...");
  }

  res.status(201).json(order);
};

const getAllOrder = async (req, res) => {
  const getOrders = await Order.find().populate("user").populate("product");

  if (!getOrders) {
    res.status(404);
    throw new Error("Order Does Not Found...");
  }

  res.status(200).json(getOrders);
};

const getSingleOrder = async (req, res) => {
  const orderId = req.params.oid;

  const singleOrder = await Order.findById(orderId)
    .populate("user")
    .populate("product");

  if (!singleOrder) {
    res.status(409);
    throw new Error("Order Not Found..");
  }

  res.status(200).json(singleOrder);
};

const orderController = { createOrder, getAllOrder, getSingleOrder };

export default orderController;
