import Product from "../models/ProductModel.js";

class ProductController {
  async getAllProducts(req, res) {
    try {
      const products = await Product.find({});
      res.status(200).json({
        message: "Get Product Done!!!",
        data: products,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  async getProductDetail(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product NotFound" });
      }
      res
        .status(200)
        .json({ message: "Get Product Details Done", data: product });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  async createProduct(req, res) {
    try {
      const product = await Product.create(req.body);
      res
        .status(201)
        .json({ message: "Create Product Successfully!!!", data: product });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  async updateProduct(req, res) {
    try {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!product) {
        return res.status(404).json({
          message: " Product Not Found",
        });
      }
      res
        .status(200)
        .json({ message: "Update Product Successfully!!!", data: product });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  async deleteProduct(req, res) {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product Not Found" });
      }
      res.status(200).json({ message: "Delete Product Successfully!!!" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default ProductController;
