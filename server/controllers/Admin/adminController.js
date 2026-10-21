import fs from "node:fs";
import uploadToCloudinary from "../../middleware/cloudinaryMiddleware.js";
import Product from "../../models/productModel.js";
import User from "../../models/userModel.js";
import Pathologist from "../../models/pathologistModel.js";
import Doctor from "../../models/doctorModel.js";
import Order from "../../models/orderModel.js";
import { error } from "node:console";

const removeTempFile = (path) => {
  try {
    if (path && fs.existsSync(path)) fs.unlinkSync(path);
  } catch {
    // best-effort cleanup only
  }
};

const toTrimmedString = (value) =>
  typeof value === "string" ? value.trim() : "";

const toBoolean = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (["true", "1", "on"].includes(value.toLowerCase())) return true;
    if (["false", "0", "off"].includes(value.toLowerCase())) return false;
  }
  return fallback;
};

const validateProductFields = ({ name, description, price, stock, expiresOn }) => {
  if (!name || !description || !expiresOn) {
    return "Please fill name, description and expiry date.";
  }
  if (price === undefined || price === null || price === "") {
    return "Please enter a valid price greater than zero.";
  }
  const priceNum = Number(price);
  if (!Number.isFinite(priceNum) || priceNum <= 0) {
    return "Please enter a valid price greater than zero.";
  }
  if (stock === undefined || stock === null || stock === "") {
    return "Please enter a valid stock quantity (0 or more).";
  }
  const stockNum = Number(stock);
  if (!Number.isInteger(stockNum) || stockNum < 0) {
    return "Please enter a valid stock quantity (0 or more).";
  }
  if (Number.isNaN(new Date(expiresOn).getTime())) {
    return "Please enter a valid expiry date.";
  }
  return null;
};

const getAllUsers = async (req, res) => {
  const users = await User.find();

  if (!users || users.length === 0) {
    return res.status(200).json([]);
  }

  res.status(200).json(users);
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find().populate("user").populate("product");

  if (!orders || orders.length === 0) {
    return res.status(200).json([]);
  }

  res.status(200).json(orders);
};

const getAllDoctors = async (req, res) => {
  const doctors = await Doctor.find().populate("user");

  if (!doctors || doctors.length === 0) {
    return res.status(200).json([]);
  }

  res.status(200).json(doctors);
};

const getAllProducts = async (req, res) => {
  const products = await Product.find();

  if (!products || products.length === 0) {
    return res.status(200).json([]);
  }

  res.status(200).json(products);
};

const addProduct = async (req, res) => {
  const name = toTrimmedString(req.body?.name);
  const description = toTrimmedString(req.body?.description);
  const expiresOn = toTrimmedString(req.body?.expiresOn);
  const { price, stock } = req.body ?? {};
  const isActive = toBoolean(req.body?.isActive, true);

  const validationError = validateProductFields({
    name,
    description,
    price,
    stock,
    expiresOn,
  });
  if (validationError) {
    removeTempFile(req.file?.path);
    res.status(400);
    throw new Error(validationError);
  }

  if (!req.file) {
    res.status(400);
    throw new Error("Product image is required.");
  }

  // upload image to cloudinary (existing storage mechanism)
  const imageURL = await uploadToCloudinary(req.file.path);
  removeTempFile(req.file.path);

  if (!imageURL?.secure_url) {
    res.status(502);
    throw new Error("Image upload failed. Please retry.");
  }

  const product = await Product.create({
    name,
    description,
    price: Number(price),
    stock: Number(stock),
    expiresOn,
    image: imageURL.secure_url,
    isActive,
  });

  if (!product) {
    res.status(500);
    throw new Error("Product Not Created..");
  }

  res.status(201).json(product);
};

const PRODUCT_UPDATABLE_FIELDS = [
  "name",
  "description",
  "price",
  "stock",
  "expiresOn",
  "isActive",
];

const updateProduct = async (req, res) => {
  const productId = req.params.pid;

  const product = await Product.findById(productId);

  if (!product) {
    removeTempFile(req.file?.path);
    res.status(404);
    throw new Error("No Product Found..");
  }

  // Whitelist only real schema fields; anything else in the body is ignored
  // so unspecified fields can never be overwritten or injected.
  const updates = {};
  for (const field of PRODUCT_UPDATABLE_FIELDS) {
    if (req.body?.[field] === undefined) continue;
    if (field === "name" || field === "description" || field === "expiresOn") {
      updates[field] = toTrimmedString(req.body[field]);
    } else if (field === "price" || field === "stock") {
      updates[field] = Number(req.body[field]);
    } else if (field === "isActive") {
      updates[field] = toBoolean(req.body[field], product.isActive);
    }
  }

  if (req.file) {
    const imageURL = await uploadToCloudinary(req.file.path);
    removeTempFile(req.file.path);
    if (!imageURL?.secure_url) {
      res.status(502);
      throw new Error("Image upload failed. Please retry.");
    }
    updates.image = imageURL.secure_url;
  }

  if (Object.keys(updates).length === 0) {
    res.status(400);
    throw new Error("No valid fields supplied to update.");
  }

  const merged = {
    name: updates.name ?? product.name,
    description: updates.description ?? product.description,
    price: updates.price ?? product.price,
    stock: updates.stock ?? product.stock,
    expiresOn: updates.expiresOn ?? product.expiresOn,
  };
  const validationError = validateProductFields(merged);
  if (validationError) {
    res.status(400);
    throw new Error(validationError);
  }

  const updatedProduct = await Product.findByIdAndUpdate(productId, updates, {
    new: true,
    runValidators: true,
  });
  if (!updatedProduct) {
    res.status(404);
    throw new Error("Product Not Updated...");
  }

  res.status(200).json(updatedProduct);
};

const deleteProduct = async (req, res) => {
  const productId = req.params.pid;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("No Product Found..");
  }

  // Preserve order history and financial records: products referenced by
  // existing orders are deactivated (hidden from the catalog, which only
  // lists isActive products) instead of hard-deleted.
  const orderCount = await Order.countDocuments({ product: productId });
  if (orderCount > 0) {
    const deactivated = await Product.findByIdAndUpdate(
      productId,
      { isActive: false },
      { new: true },
    );
    return res.status(200).json({
      message: `Product is referenced by ${orderCount} order(s) and was deactivated instead of deleted to preserve order history.`,
      softDeleted: true,
      product: deactivated,
    });
  }

  await Product.findByIdAndDelete(productId);
  return res.status(200).json({
    message: "Product deleted successfully.",
    softDeleted: false,
    id: productId,
  });
};

const getAllPathologists = async (req, res) => {
  const pathologists = await Pathologist.find().populate("user");

  if (!pathologists || pathologists.length === 0) {
    return res.status(200).json([]);
  }

  res.status(200).json(pathologists);
};

const updatePathologist = async (req, res) => {
  let pid = req.params.pid;

  const { isVerified } = req.body;

  const updatedPathologist = await Pathologist.findByIdAndUpdate(
    pid,
    { isVerified },
    { new: true },
  ).populate("user");

  if (!updatedPathologist) {
    res.status(409);
    throw new Error("Pathologist Not Updated...");
  }

  console.log(updatedPathologist);

  if (updatedPathologist.isVerified) {
    await User.findByIdAndUpdate(
      updatedPathologist.user,
      { userType: "PATHOLOGIST" },
      { new: true },
    );
  }
  if (!updatedPathologist.isVerified) {
    await User.findByIdAndUpdate(
      updatedPathologist.user,
      { userType: "USER" },
      { new: true },
    );
  }

  res.status(200).json(updatedPathologist);
};

const updateDoctor = async (req, res) => {
  let did = req.params.did;

  const { isVerified } = req.body;

  const updatedDoctor = await Doctor.findByIdAndUpdate(
    did,
    { isVerified },
    { new: true },
  ).populate("user");

  if (!updatedDoctor) {
    res.status(409);
    throw new Error("Doctor Not Updated...");
  }

  if (updatedDoctor.isVerified) {
    await User.findByIdAndUpdate(
      updatedDoctor.user,
      { userType: "DOCTOR" },
      { new: true },
    );
  }
  if (!updatedDoctor.isVerified) {
    await User.findByIdAndUpdate(
      updatedDoctor.user,
      { userType: "USER" },
      { new: true },
    );
  }

  res.status(200).json(updatedDoctor);
};

const updateOrder = async (req, res) => {
  const orderId = req.params.oid;

  const { status } = req.body;

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true },
  )
    .populate("user")
    .populate("product");

  if (!updatedOrder) {
    res.status(409);
    throw new Error("Order Not Updated...");
  }

  res.status(200).json(updatedOrder);
};

const adminService = {
  getAllUsers,
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getAllPathologists,
  updatePathologist,
  updateDoctor,
  updateOrder,
  getAllOrders,
  getAllDoctors,
};

export default adminService;
