import Category from "../models/CategoryModel.js";

class CategoryController {
  // Lấy tất cả danh mục và các danh mục con (nếu có)
  async getAllCategories(req, res) {
    try {
      const categories = await Category.find({})
        .populate("parent_id", "title")
        .exec();

      res.status(200).json({
        message: "Lấy danh mục thành công!",
        data: categories,
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
      const category = await Category.findById(req.params.id)
        .populate("parent_id", "title")
        .exec();

      if (!category) {
        return res.status(404).json({
          message: "Không tìm thấy danh mục",
        });
      }

      // Tìm tất cả các danh mục con của danh mục hiện tại
      const subcategories = await Category.find({ parent_id: category._id });

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
