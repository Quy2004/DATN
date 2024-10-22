import Order from '../models/OderModel.js';
import Cart from '../models/Cart.js';
// import { createOrderDetail } from './OrderDetail'; // Import hàm từ file orderDetailController.js

// Hàm tạo đơn hàng

// Hàm tạo đơn hàng
export const createOrder = async (req, res) => {
    try {
        const { userId, addressId, payment_id, note = '' } = req.body; // Lấy thông tin từ request body

       // Lấy giỏ hàng của người dùng
       const cart = await Cart.findOne({ userId }).populate('products.product'); // Populating sản phẩm trong giỏ hàng
       // Kiểm tra giỏ hàng có tồn tại và không rỗng
       if (!cart || !cart.products.length) {
           console.log("Giỏ hàng:", cart); // In thông tin giỏ hàng
           return res.status(400).json({ message: "Giỏ hàng rỗng." });
       }

       // Lấy tổng giá từ giỏ hàng
       const totalPrice = cart.totalprice; // Sửa thành totalPrice (giá trị trong Cart)

       // Tạo đơn hàng mới
       const order = new Order({
           user_id: userId,
           address_id: addressId,
           totalPrice: totalPrice,
           payment_id: payment_id || null, // Hoặc điền ID thanh toán nếu có
           orderDetail_id: [], // Khởi tạo với mảng rỗng nếu cần
           orderNumber: '', // Có thể tạo orderNumber sau này
           note: note, // Ghi chú
           status: 'Đang xử lý',
       });

       // Lưu đơn hàng vào database
       await order.save();

      
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
  
      if (!orders.length) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
      }
  
      return res.status(200).json(orders);
    } catch (error) {
      return res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại.", error: error.message });
    }
  };