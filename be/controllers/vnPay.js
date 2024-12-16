import Order from "../models/OderModel.js"; // Đảm bảo đúng chính tả file
import moment from "moment";
import dotenv from "dotenv";
import mongoose from "mongoose";
import qs from "qs"; // Thêm qs để serialize data cho POST request
import Cart from "../models/Cart.js";
import OrderDetailModel from "../models/OrderDetailModel.js";
import NotificationModel from "../models/NotificationModel.js";

class VnPayController {
  async updateTransaction(req, res) {
    try {
        const orderId = req.query.vnp_TxnRef;
        const resultCode = req.query.vnp_ResponseCode;

        // Kiểm tra trạng thái thanh toán
        if (orderId) {
            // Cập nhật trạng thái đơn hàng dựa trên kết quả của giao dịch
            if (resultCode === "00") {
                // Thanh toán thành công (giữ nguyên logic cũ)
                const order = await Order.findByIdAndUpdate(
                    orderId,
                    { paymentStatus: "paid" },
                    { new: true }
                );
                if (!order) {
                    return res.status(404).json({ message: "Order not found" });
                }
                const notification = new NotificationModel({
                  title: "Đặt hàng thành công",
                  message: `Đơn hàng mã "${orderId}" của bạn đã được đặt thành công với phương thức thanh toán bằng thẻ VNPay. Trạng thái đơn hàng: đã được thanh toán.`,
                  user_Id: order?.user_id || null,
                  order_Id: orderId,
                  type: "general", // Giá trị hợp lệ
                  isGlobal: false,
              });
              await notification.save();

                // Phần xử lý giỏ hàng như cũ
                const orderDetails = await OrderDetailModel.find({
                    _id: { $in: order.orderDetail_id },
                });

                for (const detail of orderDetails) {
                    const productId = detail.product_id;
                    const size = detail.product_size;
                    const toppings = detail.product_toppings || [];

                    await Cart.updateMany(
                        { userId: order.user_id },
                        {
                            $pull: {
                                products: {
                                    product: productId,
                                    product_sizes: size,
                                    product_toppings: toppings.length
                                        ? { $in: toppings }
                                        : { $size: 0 },
                                },
                            },
                        }
                    );
                    
                }
            } else {
                // Mở rộng xử lý các trường hợp hủy thanh toán
                const cancelReasons = {
                    "11": "Transaction failed",
                    "12": "Invalid card",
                    "13": "Card expired",
                    "14": "Invalid transaction",
                    "15": "Insufficient funds",
                    "99": "Unknown error"
                };

                // Cập nhật trạng thái đơn hàng khi hủy
                await Order.findByIdAndUpdate(
                    orderId,
                    { 
                        paymentStatus: "failed", 
                        paymentCancelReason: cancelReasons[resultCode] || `Undefined error (${resultCode})`,
                        paymentCancelledAt: new Date()
                    },
                    { new: true }
                );
            }
        }

        // Điều hướng người dùng đến trang kết quả
        if (resultCode === "00") {
            // Thành công
            return res.redirect(
                "http://localhost:5173/order-result?payment_order_status=true"
            );
        } else {
            // Thất bại hoặc hủy
            return res.redirect(
                "http://localhost:5173/order-result?payment_order_status=false"
            );
        }
    } catch (error) {
        console.log("updateTransaction", error);
        return res
            .status(500)
            .json({ message: "An error occurred while updating payment status" });
    }
}
}







export default VnPayController;
