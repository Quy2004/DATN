import Order from "../models/OderModel.js"; // Đảm bảo chính tả file
import moment from "moment";
import dotenv from "dotenv";
import mongoose from "mongoose";
import qs from "qs";
import Cart from "../models/Cart.js";
import NotificationModel from "../models/NotificationModel.js";

class VnPayController {
    async updateTransaction(req, res) {
        try {
            const orderId = req.query.vnp_TxnRef; // Mã đơn hàng từ VNPay
            const resultCode = req.query.vnp_ResponseCode; // Mã phản hồi từ VNPay

            if (!orderId || !resultCode) {
                return res.status(400).json({ message: "Missing required parameters" });
            }

            // Tìm đơn hàng theo ID
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }

            if (resultCode === "00") {
                // Thanh toán thành công
                order.paymentStatus = "paid";
                await order.save();

                const notification = new NotificationModel({
                    title: "Đặt hàng thành công",
                    message: `Đơn hàng mã "${orderId}" của bạn đã được đặt thành công vớ phương thức thanh toán bằng thẻ VNPay. Trạng thái đơn hàng: đã được thanh toán.`,
                    user_Id: order?.user_id || null,
                    order_Id: orderId,
                    type: "general", // Giá trị hợp lệ
                    isGlobal: false,
                });
                await notification.save();
                

                // Xóa giỏ hàng người dùng
                if (order.user_id) {
                    await Cart.deleteMany({ userId: order.user_id });
                }
            } else {
                // Thanh toán thất bại hoặc bị hủy
                order.paymentStatus = "failed";
                await order.save();
            }

            // Điều hướng người dùng đến trang kết quả
            const redirectUrl =
                resultCode === "00"
                    ? "http://localhost:5173/order-result?payment_order_status=true"
                    : "http://localhost:5173/order-result?payment_order_status=false";
            return res.redirect(redirectUrl);

        } catch (error) {
            console.error("updateTransaction error:", error);
            return res.status(500).json({ message: "An error occurred while updating payment status" });
        }
    }
}

export default VnPayController;
