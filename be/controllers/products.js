import Product from "../models/ProductModel.js";

class ProductController {
  async getAllProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        category,
        status,
        size,
        topping,
        isDeleted,
      } = req.query;

      // Tạo query để tìm kiếm, lọc theo các tiêu chí
      let query = {
        isDeleted: false, // Chỉ lấy các sản phẩm chưa bị xóa
        name: { $regex: search, $options: "i" }, // Tìm kiếm theo tên sản phẩm
      };

      // Lọc theo danh mục
      if (category) {
        query.category_id = category;
      }

      if (status) {
        query.status = status;
      }

      // Filter by size
      if (size) {
        query["product_sizes.size_id"] = size;
      }

      // Filter by topping
      if (topping) {
        query["product_toppings.topping_id"] = topping;
      }

      // Filter by isDeleted (soft deletion)
      if (isDeleted !== undefined) {
        query.isDeleted = isDeleted === "true"; // Convert to boolean
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        populate: [
          "category_id",
          "product_sizes.size_id",
          "product_toppings.topping_id",
        ],
      };

      const products = await Product.paginate(query, options);

      res.status(200).json({
        message: "Lấy sản phẩm thành công",
        data: products.docs,
        totalPages: products.totalPages,
        currentPage: products.page,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getProductDetail(req, res) {
    try {
      const product = await Product.findById(req.params.id)
        .populate("category_id")
        .populate("product_sizes.size_id")
        .populate("product_toppings.topping_id");

      if (!product || product.isDeleted) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      }

      res.status(200).json({
        message: "Lấy chi tiết sản phẩm thành công",
        data: product,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async createProduct(req, res) {
    try {
      const product = await Product.create(req.body);
      res.status(201).json({
        message: "Tạo sản phẩm thành công",
        data: product,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Cập nhật sản phẩm
  async updateProduct(req, res) {
    try {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });

      if (!product || product.isDeleted) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      }

      res.status(200).json({
        message: "Cập nhật sản phẩm thành công",
        data: product,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  // Xóa mềm
  async softDeleteProduct(req, res) {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { isDeleted: true },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      }

      res.status(200).json({
        message: "Xóa mềm sản phẩm thành công",
        data: product,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  //Xóa cứng
  async hardDeleteProduct(req, res) {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);

      if (!product) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      }

      res.status(200).json({ message: "Xóa sản phẩm vĩnh viễn thành công" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  // Khôi phục sản phẩm đã xóa mềm
  async restoreProduct(req, res) {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { isDeleted: false },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      }

      res.status(200).json({
        message: "Khôi phục sản phẩm thành công",
        data: product,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default ProductController;
