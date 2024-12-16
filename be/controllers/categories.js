import Category from "../models/CategoryModel.js";

class CategoryController {
  // Lấy tất cả danh mục và các danh mục con (nếu có)
  async getAllCategories(req, res) {
    try {
      const { isDeleted, all, search, page = 1, limit } = req.query;

      // Tạo điều kiện lọc
      let query = {};

      if (isDeleted === "true") {
        // Nếu `isDeleted=true`, chỉ lấy các danh mục đã bị xóa mềm
        query.isDeleted = true;
      } else {
        // Mặc định lấy các danh mục chưa bị xóa mềm
        query.isDeleted = false;
      }

      // Nếu có từ khóa tìm kiếm, thêm điều kiện tìm kiếm theo title
      if (search) {
        query.title = { $regex: search, $options: "i" }; // Tìm kiếm không phân biệt hoa thường
      }

      // Xử lý logic phân trang
      let pageLimit = parseInt(limit, 10);
      const currentPage = parseInt(page, 10) || 1;

      // Nếu `all=true` hoặc `limit` không được đặt, bỏ qua phân trang
      if (all === "true" || isNaN(pageLimit)) {
        pageLimit = null; // Không giới hạn số lượng
      }

      const skip = (currentPage - 1) * pageLimit;

      // Thực hiện query với phân trang (nếu có `limit`)
      const queryExec = Category.find(query).populate("parent_id", "title").sort({ createdAt: -1 });

      if (pageLimit) {
        queryExec.skip(skip).limit(pageLimit);
      }

      const categories = await queryExec.exec();

      // Tổng số danh mục để tính tổng số trang
      const totalItems = await Category.countDocuments(query);

      res.status(200).json({
        message: "Lấy danh mục thành công!",
        data: categories,
        pagination: pageLimit
          ? {
              totalItems,
              currentPage,
              totalPages: Math.ceil(totalItems / pageLimit),
            }
          : null, // Không trả pagination nếu lấy toàn bộ
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  }

  // Lấy chi tiết danh mục bao gồm cả danh mục con (nếu có)
  async getCategoryDetails(req, res) {
    try {
      const category = await Category.findOne({
        _id: req.params.id,
        isDeleted: false,
      }) // Tìm danh mục chưa bị xóa mềm
        .populate("parent_id", "title")
        .exec();

      if (!category) {
        return res.status(404).json({
          message: "Không tìm thấy danh mục",
        });
      }

      // Tìm tất cả các danh mục con chưa bị xóa mềm của danh mục hiện tại
      const subcategories = await Category.find({
        parent_id: category._id,
        isDeleted: false,
      });

      res.status(200).json({
        message: "Lấy chi tiết danh mục thành công!",
        data: {
          category,
          subcategories,
        },
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  }

  // Tạo danh mục mới
  async createCategory(req, res) {
    try {
      const category = await Category.create(req.body);
      res.status(201).json({
        message: "Tạo danh mục thành công!",
        data: category,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  }

  // Cập nhật danh mục hiện có
  async updateCategory(req, res) {
    try {
      const category = await Category.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );
      if (!category) {
        return res.status(404).json({
          message: "Không tìm thấy danh mục",
        });
      }
      res.status(200).json({
        message: "Cập nhật danh mục thành công!",
        data: category,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  }
  // Xóa mềm danh mục
  async softDeleteCategory(req, res) {
    try {
      const category = await Category.findByIdAndUpdate(
        req.params.id,
        { isDeleted: true }, // Đánh dấu là xóa mềm
        { new: true }
      );
      if (!category) {
        return res.status(404).json({
          message: "Không tìm thấy danh mục",
        });
      }
      res.status(200).json({
        message: "Xóa mềm danh mục thành công!",
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  }

  // Xóa cứng danh mục
  async deleteCategory(req, res) {
    try {
      const category = await Category.findByIdAndDelete(req.params.id);
      if (!category) {
        return res.status(404).json({
          message: "Không tìm thấy danh mục",
        });
      }
      res.status(200).json({
        message: "Xóa cứng danh mục thành công!",
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  }
  // Khôi phục
  async restoreCategory(req, res) {
    try {
      // Tìm và cập nhật thuộc tính isDeleted của danh mục thành false
      const category = await Category.findByIdAndUpdate(
        req.params.id,
        { isDeleted: false }, // Đặt lại isDeleted thành false để khôi phục
        { new: true } // Trả về danh mục đã được cập nhật
      );

      if (!category) {
        return res.status(404).json({
          message: "Không tìm thấy danh mục để khôi phục",
        });
      }

      res.status(200).json({
        message: "Khôi phục danh mục thành công!",
        data: category,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  }
}

export default CategoryController;
