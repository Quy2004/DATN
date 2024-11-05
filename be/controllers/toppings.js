import Topping from "../models/ToppingModel";

class ToppingController {
  // Lấy tất cả topping
  async getAllToppings(req, res) {
    try {
      const {
        page = 1,
        limit,
        search,
        statusTopping,
        category,
        isDeleted,
        sortBy,
        order,
      } = req.query;

      const query = {};

      // Tìm kiếm theo tên topping
      if (search) {
        query.nameTopping = { $regex: search, $options: "i" }; // Không phân biệt hoa thường
      }
      if (category) {
        query.category_id = category; // Chỉ lấy size thuộc về danh mục được chỉ định
      }
      // Lọc theo trạng thái (available/unavailable)
      if (statusTopping) {
        query.statusTopping = statusTopping;
      }

      // Lọc theo trạng thái xóa mềm
      if (isDeleted !== undefined) {
        query.isDeleted = isDeleted === "true"; // Kiểm tra nếu isDeleted là chuỗi 'true'
      }

      // Sắp xếp (default: sắp xếp theo tên, thứ tự tăng dần)
      let sort = {};
      if (sortBy) {
        sort[sortBy] = order === "desc" ? -1 : 1; // Sắp xếp theo yêu cầu (mặc định tăng dần)
      } else {
        sort = { nameTopping: 1 }; // Sắp xếp theo tên tăng dần nếu không có yêu cầu
      }

      // Phân trang
      const toppings = await Topping.find(query)
        .populate("category_id", "title")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await Topping.countDocuments(query);

      res.status(200).json({
        message: "Lấy danh sách topping thành công!!!",
        data: toppings,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Lấy chi tiết một topping
  async getToppingDetail(req, res) {
    try {
      const topping = await Topping.findById(req.params.id);
      if (!topping) {
        return res.status(404).json({ message: "Không tìm thấy topping" });
      }
      res
        .status(200)
        .json({ message: "Lấy chi tiết topping thành công", data: topping });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Tạo mới một topping
  async createTopping(req, res) {
    try {
      const { nameTopping, priceTopping, statusTopping, category_id } =
        req.body;
      // Kiểm tra xem topping đã tồn tại hay chưa
      const existingTopping = await Topping.findOne({
        nameTopping: req.body.nameTopping,
        isDeleted: false,
      });

      if (existingTopping) {
        return res.status(400).json({ message: "Tên topping đã tồn tại!" });
      }

      if (!priceTopping || isNaN(priceTopping) || priceTopping <= 0) {
        return res.status(400).json({ message: "Giá topping không hợp lệ!" });
      }

      // Tạo mới topping
      const topping = await Topping.create({
        nameTopping,
        priceTopping,
        statusTopping,
        category_id,
      });
      res
        .status(201)
        .json({ message: "Tạo topping thành công!!!", data: topping });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Cập nhật thông tin topping
  async updateTopping(req, res) {
    try {
      // Kiểm tra xem tên topping mới đã tồn tại cho một topping khác chưa (loại trừ topping hiện tại)
      const existingTopping = await Topping.findOne({
        nameTopping: req.body.nameTopping,
        isDeleted: false,
        _id: { $ne: req.params.id }, // Loại trừ topping hiện tại khỏi kiểm tra trùng lặp
      });

      if (existingTopping) {
        return res.status(400).json({ message: "Tên topping đã tồn tại!" });
      }

      // Cập nhật topping
      const topping = await Topping.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });

      if (!topping || topping.isDeleted) {
        return res.status(404).json({ message: "Không tìm thấy topping" });
      }

      res
        .status(200)
        .json({ message: "Cập nhật topping thành công!!!", data: topping });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Xóa topping
  // Xóa mềm topping
  async softDeleteTopping(req, res) {
    try {
      const topping = await Topping.findByIdAndUpdate(req.params.id, {
        isDeleted: true,
      });
      if (!topping || topping.isDeleted) {
        return res.status(404).json({ message: "Không tìm thấy topping" });
      }
      res.status(200).json({ message: "Xóa mềm topping thành công!!!" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Xóa cứng topping (thực sự xóa khỏi cơ sở dữ liệu)
  async hardDeleteTopping(req, res) {
    try {
      const topping = await Topping.findByIdAndDelete(req.params.id);
      if (!topping) {
        return res.status(404).json({ message: "Không tìm thấy topping" });
      }
      res.status(200).json({ message: "Xóa cứng topping thành công!!!" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  // Cập nhật trạng thái topping
  async updateStatusTopping(req, res) {
    try {
      const { statusTopping } = req.body; // Lấy trạng thái mới từ request body

      // Kiểm tra nếu trạng thái được truyền vào không hợp lệ
      if (
        !statusTopping ||
        !["available", "unavailable"].includes(statusTopping)
      ) {
        return res.status(400).json({ message: "Trạng thái không hợp lệ!" });
      }

      // Cập nhật trạng thái của topping
      const topping = await Topping.findByIdAndUpdate(
        req.params.id,
        { statusTopping },
        { new: true }
      );

      if (!topping || topping.isDeleted) {
        return res.status(404).json({ message: "Không tìm thấy topping" });
      }

      res.status(200).json({
        message: "Cập nhật trạng thái topping thành công!",
        data: topping,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  // Khôi phục topping
  async restoreTopping(req, res) {
    try {
      const topping = await Topping.findByIdAndUpdate(
        req.params.id,
        { isDeleted: false },
        { new: true }
      );

      if (!topping) {
        return res.status(404).json({ message: "Không tìm thấy topping" });
      }

      res.status(200).json({
        message: "Khôi phục topping thành công!",
        data: topping,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default ToppingController;
