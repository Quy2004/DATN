import Size from "../models/Size.js";

class SizeController {
  // hiển thị toàn bộ size

  async getAllSize(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        category,
        isDeleted = "false", // Mặc định chỉ lấy những size không bị xóa
      } = req.query;

      const query = {
        isDeleted: isDeleted === "true",
      };

      if (search) {
        query.name = { $regex: search, $options: "i" };
      }

      if (category) {
        query.category_id = category; // Chỉ lấy size thuộc về danh mục được chỉ định
      }

      const pageLimit = parseInt(limit, 10) || 10;
      const currentPage = parseInt(page, 10) || 1;

      const sizes = await Size.find(query)
        .populate("category_id", "title")
        .limit(pageLimit)
        .skip((currentPage - 1) * pageLimit)
        .lean();

      const totalItems = await Size.countDocuments(query);

      res.status(200).json({
        message: "Lấy sản phẩm thành công",
        data: sizes,
        pagination: {
          totalItems: totalItems,
          currentPage: currentPage,
          totalPages: Math.ceil(totalItems / pageLimit),
        },
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  
  

  // hiển thị chi tiết 1 danh mục
  async getSizeById(req, res) {
    try {
      const { id } = req.params;
      const size = await Size.findById(id);
      if (!size) {
        return res.status(404).json({ message: "Size không tìm thấy" });
      }
      res.status(200).json({
        message: "Get Size Details Done",
        data: size,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // thêm mới size
  async createSize(req, res) {
    try {
      // Thêm giá trị mặc định cho priceSize nếu nó không có trong request body
      const { name, priceSize = null, category_id } = req.body;

      const size = await Size.create({ name, priceSize, category_id });

      res.status(201).json({
        message: "Create Size Successfully",
        data: size,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // cập nhật size
  async updateSize(req, res) {
    try {
      const size = await Size.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!size) {
        return res.status(404).json({ message: "Size không tìm thấy" });
      }
      res.status(200).json({
        message: "Update Size Successfully",
        data: size,
      });
    } catch (error) {
      res.status(error.message).json({ message: error.message });
    }
  }

  // xóa size
  async deleteSize(req, res) {
    try {
      const { id } = req.params;
      const size = await Size.findByIdAndDelete({ _id: id });
      res.status(201).json({
        message: "Delete Size Successfully",
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async softDeleteSize(req, res) {
    try {
      const size = await Size.findByIdAndUpdate(
        req.params.id,
        { isDeleted: true },
        { new: true }
      );

      if (!size) {
        return res.status(404).json({ message: "Size not found" });
      }
      res.status(200).json({
        message: "Delete Size Successfully",
        data: size,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  }

  // Khôi phục danh mục khi bị xóa mềm
  async restoreSize(req, res) {
    try {
      const size = await Size.findByIdAndUpdate(
        req.params.id,
        { isDeleted: false },
        { new: true }
      );

      if (!size) {
        return res.status(404).json({ message: "Size not found" });
      }
      res.status(200).json({
        message: "Delete Size Successfully",
        data: size,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  }
}

export default SizeController;
