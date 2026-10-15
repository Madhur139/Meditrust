import fs from "node:fs";
import uploadToCloudinary from "../../middleware/cloudinaryMiddleware.js";
import Product from "../../models/productModel.js";
import User from "../../models/userModel.js";
import Pathologist from "../../models/pathologistModel.js";
import Doctor from "../../models/doctorModel.js";
import Order from "../../models/orderModel.js";
import { error } from "node:console";

const getAllUsers = async (req, res) => {
  const users = await User.find();

  if (!users) {
    res.status(404);
    throw new Error("Users Not Found... ");
  }

  res.status(200).json(users);
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find().populate("user").populate("product");

  if (!orders) {
    res.status(404);
    throw new Error("Orders Not Found..");
  }

  res.status(200).json(orders);
};

const getAllDoctors = async (req, res) => {
  const doctors = await Doctor.find();

  if (!doctors) {
    res.status(404);
    throw new Error("Doctors Is Not Found...");
  }

  res.status(200).json(doctors);
};

const getAllProducts = async (req, res) => {
  const products = await Product.find();

  if (!products) {
    res.status(404);
    throw new Error("Products Not Found..");
  }

  res.status(200).json(products);
};

const addProduct = async (req, res) => {
  const { name, description, price, stock, expiresOn } = req.body;

  if (!name || !description || !price || !stock || !expiresOn) {
    res.status(409);
    throw new Error("Plz Fill All The Details...");
  }

  // upload image to cloudinary
  const imageURL = await uploadToCloudinary(req.file.path);
  fs.unlinkSync(req.file.path);

  console.log(imageURL);

  const product = await Product.create({
    name,
    description,
    price,
    stock,
    expiresOn,
    image: imageURL.secure_url,
  });

  if (!product) {
    res.status(404);
    throw new Error("Product Not Created..");
  }

  res.status(201).json(product);
};

const updateProduct = async (req, res) => {
  const productId = req.params.pid;

  const product = await Product.findById(productId);

  if (!product) {
    res.status(409);
    throw new Error("No Product Found..");
  }

  // if (req.file) {
  //   const updateImage = await Product.findByIdAndUpdate(productId, req.file, {
  //     new: true,
  //   });
  // }

  // // upload image to cloudinary
  // const imageURI = await uploadToCloudinary(req.file.path);
  // fs.unlinkSync(req.file.path);

  const updatedProduct = await Product.findByIdAndUpdate(productId, req.body, {
    new: true,
  });
  if (!updatedProduct) {
    res.status(409);
    throw new Error("Product Not Updated...");
  }

  res.status(200).json(updatedProduct);
};

const getAllPathologists = async (req, res) => {
  const pathologists = await Pathologist.find().populate("user");

  if (!pathologists) {
    res.status(404);
    throw new Error("Pathologists Not Found...");
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
  getAllPathologists,
  updatePathologist,
  updateDoctor,
  updateOrder,
  getAllOrders,
  getAllDoctors,
};

export default adminService;
