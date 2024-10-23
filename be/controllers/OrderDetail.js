import OrderDetail from "../models/OrderDetailModel";
import { StatusCodes } from "http-status-codes";

export const createOrderDetail = async (orderId, productId, quantity, price, image) => {
    try {
        // Kiểm tra xem các tham số đã được truyền đún
      
    } catch (error) {
        console.error("Lỗi trong createOrderDetail:", error);
        throw new Error("Không thể tạo chi tiết đơn hàng.");
    }
};