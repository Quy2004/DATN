import Topping from "../models/ToppingModel";

class ToppingController {
  // Lấy tất cả topping
  async getAllToppings(req, res) {
    try {
      const toppings = await Topping.find({});
      res.status(200).json({
        message: "Lấy danh sách topping thành công!!!",
        data: toppings,
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
}

export default ToppingController;
