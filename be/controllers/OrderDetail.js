import OrderDetail from "../models/OrderDetailModel";
import { StatusCodes } from "http-status-codes";

export const createOrderDetail = async (orderId, productId, quantity, price, image) => {
    try {
        // Kiểm tra xem các tham số đã được truyền đún
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