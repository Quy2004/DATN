import Order from "../models/OderModel";
import OrderDetail from "../models/OrderDetailModel";
import { StatusCodes } from "http-status-codes";

export const getByUser = async (req, res) => {
    try {
      const { user_id, product_id } = req.params;
  
      // Tìm tất cả đơn hàng của user_id và có chứa product_id trong chi tiết đơn hàng, đồng thời có orderStatus = "completed"
      const orders = await Order.find({
        user_id,
        orderStatus: "completed", // Thêm điều kiện orderStatus
      }).populate({
        path: "orderDetail_id", // Liên kết với OrderDetail
        match: { "product_id": product_id }, // Lọc chi tiết đơn hàng theo product_id
      });
  
      // Kiểm tra nếu không tìm thấy đơn hàng nào
      if (!orders || orders.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng hoàn thành cho người dùng này và sản phẩm này" });
      }
  
      // Kiểm tra nếu trong các đơn hàng không có chi tiết đơn hàng chứa product_id
      const filteredOrders = orders.filter(order => order.orderDetail_id.length > 0);
  
      if (filteredOrders.length === 0) {
        return res.status(404).json({ message: "Không có sản phẩm này trong đơn hàng hoàn thành." });
      }
  
      res.status(200).json({
        message: "Lấy đơn hàng thành công",
        data: filteredOrders,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
export const createOrderDetail = async ({orderId, productId, quantity, price, image}) => {
    try {
        
       
        // Kiểm tra xem các tham số đã được truyền đúng
        if (!orderId || !productId || !quantity || !price) {
            throw new Error("Thiếu thông tin để tạo chi tiết đơn hàng.");
        }

        // Tạo chi tiết đơn hàng
        const orderDetail = new OrderDetail({
            order_id: orderId,
            product_id: productId,
            quantity: quantity,
            price: price,
            image: image,
        });

        // Lưu chi tiết đơn hàng vào database
        await orderDetail.save();
        return orderDetail;
      
    } catch (error) {
        console.error("Lỗi trong createOrderDetail:", error);
        throw new Error("Không thể tạo chi tiết đơn hàng.");
    }
};
// Lấy tất cả order details
export const getOrderDetails = async (req, res) => {
    try {
        const orderDetails = await OrderDetail.find().populate("order_id").populate("product_id");
        
        if (orderDetails.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: "No order details found" });
        }
        
        return res.status(StatusCodes.OK).json(orderDetails);
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};

