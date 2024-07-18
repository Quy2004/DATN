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
  async getProductDetail() {
    try {
    } catch (error) {}
  }
  async createProduct() {
    try {
    } catch (error) {}
  }
  async updateProduct() {
    try {
    } catch (error) {}
  }
  async deleteProduct() {
    try {
    } catch (error) {}
  }
}

export default ProductController;
