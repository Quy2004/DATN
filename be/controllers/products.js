import slugify from "slugify";
import Product from "../models/ProductModel.js";
import Category from "../models/CategoryModel.js";

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
        active,
      } = req.query;

      // Tạo query để tìm kiếm, lọc theo các tiêu chí
      const query = {
        isDeleted: isDeleted === "true" ? true : false,
      };

      if (search) {
        query.name = { $regex: search, $options: "i" }; // Tìm kiếm theo tên sản phẩm
      }

      // Lọc theo danh mục nếu có
      if (category) {
        query.category_id = category;
      }

      // Lọc theo trạng thái sản phẩm nếu có
      if (status) {
        query.status = status;
      }

      // Lọc theo kích thước sản phẩm nếu có
      if (size) {
        query["product_sizes.size_id"] = size;
      }

      // Lọc theo topping nếu có
      if (topping) {
        query["product_toppings.topping_id"] = topping;
      }
      if (active !== undefined) {
        query.active = active === "true";
      }
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: [
          { path: "category_id", select: "title" },
          { path: "product_sizes.size_id", select: "name priceSize" },
          { path: "product_toppings.topping_id", select: "nameTopping" },
        ],
        lean: true,
      };

      // Số lượng mục trên mỗi trang
      const pageLimit = parseInt(limit, 10) || 10; // Mặc định là 10 mục nếu không có `limit`
      const currentPage = parseInt(page, 10) || 1; // Mặc định là trang 1 nếu không có `page`

      // Thực hiện query với phân trang
      const products = await Product.paginate(query, options);
      // Tổng số danh mục để tính tổng số trang
      const totalItems = await Product.countDocuments(query);
      res.status(200).json({
        message: "Lấy sản phẩm thành công",
        data: products.docs,
        pagination: {
          totalItems: products.totalDocs,
          currentPage: products.page,
          totalPages: products.totalPages,
        },
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getTeaProducts(req, res) {
    try {
      const { page = 1, limit = 8 } = req.query; // Lấy tham số phân trang

      // Tìm danh mục "Trà"
      const category = await Category.findOne({ title: "Trà" });
      if (!category) {
        return res
          .status(404)
          .json({ message: "Danh mục 'Trà' không tồn tại" });
      }

      // Tìm tất cả danh mục con của "Trà" (bao gồm cả danh mục "Trà" chính)
      const subCategories = await Category.find({ parent_id: category._id });
      const categoryIds = [
        category._id,
        ...subCategories.map((subCategory) => subCategory._id),
      ];

      // Tìm các sản phẩm thuộc các danh mục con của "Trà" và có trạng thái "available"
      const products = await Product.find({
        category_id: { $in: categoryIds },
        isDeleted: false, // Sản phẩm chưa bị xóa
        active: { $ne: false }, // Loại bỏ sản phẩm có active = true
      })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit) // Phân trang: bỏ qua các sản phẩm trước đó
        .limit(limit) // Giới hạn số lượng sản phẩm mỗi trang
        .populate([
          { path: "category_id", select: "title" },
          { path: "product_sizes.size_id", select: "name" },
          { path: "product_toppings.topping_id", select: "nameTopping" },
        ]);

      // Thêm logic để kiểm tra trạng thái của sản phẩm (còn hàng hay hết hàng)
      const updatedProducts = products.map((product) => ({
        ...product.toObject(),
        stockStatus: product.status === "available" ? "còn hàng" : "hết hàng",
      }));

      // Tính tổng số sản phẩm và tổng số trang
      const totalProducts = await Product.countDocuments({
        category_id: { $in: categoryIds },
        isDeleted: false,
        active: { $ne: true }, // Loại bỏ sản phẩm có active = true khi đếm
      });

      const totalPages = Math.ceil(totalProducts / limit);

      res.status(200).json({
        message:
          "Lấy sản phẩm thuộc danh mục 'Trà' và các danh mục con thành công",
        data: updatedProducts,
        totalPages,
        currentPage: page,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getCoffeProducts(req, res) {
    try {
      // Lấy số trang từ query, mặc định là trang 1
      const { page = 1, limit = 8 } = req.query; // Lấy tham số phân trang

      // Tìm danh mục "Cà phê"
      const category = await Category.findOne({ title: "Cà phê" });
      if (!category) {
        return res
          .status(404)
          .json({ message: "Danh mục 'Cà phê' không tồn tại" });
      }

      // Tìm tất cả danh mục con của "Cà phê" (bao gồm cả danh mục "Cà phê" chính)
      const subCategories = await Category.find({ parent_id: category._id });

      // Tạo mảng các category_id để tìm sản phẩm
      const categoryIds = [
        category._id,
        ...subCategories.map((subCategory) => subCategory._id),
      ];

      // Tính toán số sản phẩm cần bỏ qua (skip) cho trang hiện tại
      const skip = (page - 1) * limit;

      // Tìm các sản phẩm thuộc các danh mục con của "Cà phê" với phân trang
      const products = await Product.find({
        category_id: { $in: categoryIds },
        isDeleted: false, // Sản phẩm chưa bị xóa
        active: { $ne: false }, // Loại bỏ sản phẩm có active = true
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate([
          { path: "category_id", select: "title" },
          { path: "product_sizes.size_id", select: "name" },
          { path: "product_toppings.topping_id", select: "nameTopping" },
        ]);
      // Thêm logic để kiểm tra trạng thái của sản phẩm (còn hàng hay hết hàng)
      const updatedProducts = products.map((product) => ({
        ...product.toObject(),
        stockStatus: product.status === "available" ? "còn hàng" : "hết hàng",
      }));

      // Đếm tổng số sản phẩm để tính số trang
      const totalProducts = await Product.countDocuments({
        category_id: { $in: categoryIds },
        isDeleted: false,
        status: "available",
      });

      // Tính toán tổng số trang
      const totalPages = Math.ceil(totalProducts / limit);

      res.status(200).json({
        message:
          "Lấy sản phẩm thuộc danh mục 'Cà phê' và các danh mục con thành công",
        data: updatedProducts,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalProducts: totalProducts,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
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
  // Thêm sản phẩm mới
  async createProduct(req, res) {
    try {
      const { price, discount = 0, active = true } = req.body;

      // Tính toán giá sale_price
      const sale_price = price - (price * discount) / 100;

      const product = await Product.create({
        ...req.body,
        sale_price: sale_price.toFixed(2),
        active,
      });

      res.status(201).json({
        message: "Thêm sản phẩm thành công",
        data: product,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Cập nhật sản phẩm
  async updateProduct(req, res) {
    try {
      const { name, price, discount = 0, active } = req.body;

      // Tính toán giá sale_price
      const sale_price = price - (price * discount) / 100;
      const slug = name
        ? slugify(name, { lower: true, strict: true })
        : undefined;

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          sale_price: sale_price.toFixed(2), // Làm tròn đến 2 chữ số thập phân
          active,
          slug,
        },
        { new: true }
      );

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
  // Cập nhật trạng thái sản phẩm
  async updateStatusProduct(req, res) {
    try {
      const { status } = req.body;

      // Kiểm tra xem trạng thái có hợp lệ không
      if (!status) {
        return res.status(400).json({ message: "Trạng thái không hợp lệ" });
      }

      // Tìm sản phẩm và cập nhật trạng thái
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!product || product.isDeleted) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      }

      res.status(200).json({
        message: "Cập nhật trạng thái sản phẩm thành công",
        data: product,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  async updateActiveProduct(req, res) {
    try {
      const { active } = req.body;

      // Kiểm tra xem trạng thái có hợp lệ không
      if (typeof active !== "boolean") {
        return res
          .status(400)
          .json({ message: "Trạng thái active không hợp lệ" });
      }

      // Tìm sản phẩm và cập nhật trạng thái active
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { active },
        { new: true }
      );

      if (!product || product.isDeleted) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      }

      res.status(200).json({
        message: "Cập nhật trạng thái active sản phẩm thành công",
        data: product,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default ProductController;
