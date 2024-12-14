import Order from "../models/OderModel.js"; // Đảm bảo đúng chính tả file
import moment from "moment";
import dotenv from "dotenv";
import mongoose from "mongoose";
import qs from "qs"; // Thêm qs để serialize data cho POST request
import Cart from "../models/Cart.js";
import OrderDetailModel from "../models/OrderDetailModel.js";

class VnPayController {
  async updateTransaction(req, res) {
      try {
          const orderId = req.query.vnp_TxnRef;
          const resultCode = req.query.vnp_ResponseCode; // Tham số phản hồi từ VNPay

          // Kiểm tra trạng thái thanh toán
          if (orderId) {
              // Cập nhật trạng thái đơn hàng dựa trên kết quả của giao dịch
              if (resultCode === "00") {
                  // Thanh toán thành công
                  const order = await Order.findByIdAndUpdate(
                      orderId,
                      { paymentStatus: "paid" },
                      { new: true }
                  );
                  if (!order) {
                      return res.status(404).json({ message: "Order not found" });
                  }

                  console.log("Order Found:", order);

                  // Lấy danh sách sản phẩm từ orderDetail_id
                  const orderDetails = await OrderDetailModel.find({
                      _id: { $in: order.orderDetail_id },
                  });

                  console.log("Order Details:", orderDetails);

                  // Xóa sản phẩm khỏi giỏ hàng của người dùng
                  for (const detail of orderDetails) {
                      const productId = detail.product_id;
                      const size = detail.product_size; // Sử dụng product_size từ orderDetail
                      const toppings = detail.product_toppings || []; // Toppings của sản phẩm

                      console.log(`Processing Product ID: ${productId}, Size: ${size}, Toppings:`, toppings);

                      // Xóa sản phẩm có topping hoặc không có topping khỏi giỏ hàng
                      const result = await Cart.updateMany(
                          { userId: order.user_id },
                          {
                              $pull: {
                                  products: {
                                      product: productId,
                                      product_sizes: size, // Xóa theo size
                                      product_toppings: toppings.length
                                          ? { $in: toppings } // Nếu có topping, xóa theo topping
                                          : { $size: 0 }, // Nếu không có topping, xóa sản phẩm không có topping
                                  },
                              },
                          }
                      );

                      console.log("Cart Update Result:", result);
                  }
              } else if (resultCode === "11") {
                  // Thanh toán bị hủy hoặc thất bại
                  // Cập nhật trạng thái đơn hàng là "failed"
                  await Order.findByIdAndUpdate(
                      orderId,
                      { paymentStatus: "failed" },
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
