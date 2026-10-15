import Product from "../../models/productModel.js";

const getAllProducts = async (req, res) => {
  const products = await Product.find();

  if (!products) {
    res.status(404);
    throw new Error("Products Not Found...");
  }

  const activeProducts = products.filter((product) => product.isActive);
  res.status(200).json(activeProducts);
};

const getSingleProduct = async (req, res) => {
  const productId = req.params.pid;

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error("No Product Found...");
  }

  res.status(200).json(product);
};

const productController = { getAllProducts, getSingleProduct };

export default productController;
