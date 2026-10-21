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

  const order = await Order.create({ user: userId, product: productId });

  if (!order) {
    res.status(409);
    throw new Error("Order Not Created...");
  }

  await order.populate("product");

  res.status(201).json(order);
};

const getMyOrders = async (req, res) => {
  const userId = req.user._id ?? req.user.id;

  const orders = await Order.find({ user: userId })
    .populate("product")
    .sort({ createdAt: -1 });

  return res.status(200).json(orders ?? []);
};

const getAllOrder = async (req, res) => {
  // Any authenticated caller only ever sees their own orders here.
  // Platform-wide listing stays in the admin controller (/api/admin/orders).
  const userId = req.user._id ?? req.user.id;

  const getOrders = await Order.find({ user: userId })
    .populate("product")
    .sort({ createdAt: -1 });

  return res.status(200).json(getOrders ?? []);
};

const getSingleOrder = async (req, res) => {
  const orderId = req.params.oid;

  const singleOrder = await Order.findById(orderId).populate("product");

  if (!singleOrder) {
    res.status(404);
    throw new Error("Order Not Found..");
  }

  const ownerId = String(singleOrder.user);
  const callerId = String(req.user._id ?? req.user.id);
  const isAdmin =
    String(req.user.userType ?? "").toUpperCase() === "ADMIN";

  if (ownerId !== callerId && !isAdmin) {
    res.status(403);
    throw new Error("Access denied: this order belongs to another user.");
  }

  res.status(200).json(singleOrder);
};

const orderController = { createOrder, getAllOrder, getMyOrders, getSingleOrder };

export default orderController;
