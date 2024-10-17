import Size from "../models/Size.js";

class SizeController {
  // hiển thị toàn bộ size

  async getAllSize(req, res) {
    try {
      const { isDeleted, all, search, page = 1, limit = 10 } = req.query;

      // Tạo điều kiện lọc
      let query = {};

      if (all === "true") {
        // Nếu `all=true`, lấy tất cả danh mục
        query = {};
      } else if (isDeleted === "true") {
        // Nếu `isDeleted=true`, chỉ lấy các danh mục đã bị xóa mềm
        query.isDeleted = true;
      } else {
        // Mặc định lấy các danh mục chưa bị xóa mềm
        query.isDeleted = false;
      }

      // search - điều kiện search theo name
      if (search) {
        query.name = { $regex: search, $options: "i" };
        // không phân biệt viết hoa hay viết thường
      }

      // số lượng trên mỗi trang
      const pageLimit = parseInt(limit, 10) || 10;
      const currentPage = parseInt(page, 10) || 1;
      const skip = (currentPage - 1) * pageLimit;

      // thực hiện phân trang
      const size = await Size.find(query)
        .sort({ createdAt: -1 }) // sắp xếp theo ngày tạo giảm dần
        .skip(skip)
        .limit(pageLimit)
        .exec();

      // Tổng số danh mục để tính tổng số trang
      const totalItems = await Size.countDocuments(query);

      res.status(200).json({
        message: "Get Size Done",
        data: size,
        pagination: {
          totalItems,
          currentPage,
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
