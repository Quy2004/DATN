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
       // Kiểm tra tổng giá đơn hàng (nếu không có, tính lại từ sản phẩm)
    const totalPrice = cart.totalPrice || cart.products.reduce((acc, item) => {
        const price = item.price || 12000; // Giá mặc định nếu không có
        const quantity = item.quantity || 1; // Mặc định số lượng là 1 nếu không có
        return acc + price * quantity;
      }, 0);
  
      // In ra để kiểm tra dữ liệu
      console.log("Cart data:", cart);
      console.log("Total price calculated:", totalPrice);
      
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại.", error: error.message });
    }
  };