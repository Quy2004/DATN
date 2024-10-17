import Topping from "../models/ToppingModel";

class ToppingController {
  // Lấy tất cả topping
  async getAllToppings(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        statusTopping,
        isDeleted,
        sortBy,
        order,
      } = req.query;

      const query = {};

      // Tìm kiếm theo tên topping
      if (search) {
        query.nameTopping = { $regex: search, $options: "i" }; // Không phân biệt hoa thường
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
        .sort(sort)
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
      const topping = await Topping.create(req.body);
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
      const topping = await Topping.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!topping) {
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
  async deleteTopping(req, res) {
    try {
      const topping = await Topping.findByIdAndDelete(req.params.id);
      if (!topping) {
        return res.status(404).json({ message: "Không tìm thấy topping" });
      }
      res.status(200).json({ message: "Xóa topping thành công!!!" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default ToppingController;
