import Order from '../models/OderModel.js';


// Hàm tạo đơn hàng
export const createOrder = async (req, res) => {
    try {
      const { userId, addressId, paymentMethod } = req.body; // Lấy thông tin từ request body
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại.", error: error.message });
    }
  };