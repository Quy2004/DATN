import Order from '../models/OderModel.js';
import Cart from '../models/Cart.js';

// Hàm tạo đơn hàng
export const createOrder = async (req, res) => {
    try {
      const { userId, addressId, paymentMethod } = req.body; // Lấy thông tin từ request body
       // Lấy giỏ hàng của người dùng
    const cart = await Cart.findOne({ userId });
      // Kiểm tra giỏ hàng có tồn tại và không rỗng
      if (!cart || !cart.products.length) {
        return res.status(400).json({ message: "Giỏ hàng rỗng." });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại.", error: error.message });
    }
  };