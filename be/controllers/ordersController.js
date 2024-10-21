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
   
     // Lấy tổng giá từ giỏ hàng
 
      const totalPrice = cart.totalprice;
       // Tạo đơn hàng mới
    const order = new Order({
        user_id: userId,
        address_id: addressId,
        totalPrice: totalPrice, 
        orderDetails: cart.products.map(item => ({
          product_id: item.product,
          quantity: item.quantity,
      
        })),
        paymentMethod, 
        status: 'Đang xử lý', 
      });
       // Lưu đơn hàng vào database
      await order.save();
 // Xóa giỏ hàng sau khi tạo đơn hàng thành công
      await Cart.findOneAndDelete({ userId });
      return res.status(201).json({ message: "Đơn hàng đã được tạo thành công.", order });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại.", error: error.message });
    }

 
  }; //lấy ds đơn hàng của ng dùng
    export const getOrders = async (req, res) => {
        try {
          const { userId } = req.params;
      
          const orders = await Order.find({ user_id: userId }).populate('orderDetails.product_id'); 
          return res.status(200).json(orders);
        } catch (error) {
          return res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại.", error: error.message });
        }
      };
