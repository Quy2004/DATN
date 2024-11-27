import mongoose from "mongoose";
import axios from "axios";
import crypto from "crypto";
import Order from "../models/OderModel";
 // Chỉnh lại tên đúng của model

class MomoController {
  // Tạo thanh toán MoMo
  createMomoPayment = async (req, res) => {
    const { orderId } = req.body;

    try {
      // Tìm đơn hàng trong cơ sở dữ liệu
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Đơn hàng không tồn tại" });
      }

      // Thông tin MoMo API
      const partnerCode = "MOMO";
      const accessKey = "F8BBA842ECF85";
      const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
      const requestId = `${partnerCode}${Date.now()}`;
      const orderInfo = `Thanh toán đơn hàng ${order.orderNumber}`;
      const redirectUrl = "http://localhost:5173/oder-success"; 
      const ipnUrl = "https://callback.url/notify"; // URL nhận thông báo từ MoMo
      const amount = order.totalPrice.toString(); // Chuyển tổng giá trị đơn hàng thành chuỗi
      const requestType = "captureWallet";
      const extraData = ""; // Dữ liệu bổ sung (tuỳ chọn)

      // Tạo chuỗi raw signature
      const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${order._id}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

      // Tạo chữ ký HMAC SHA256
      const signature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature)
        .digest("hex");

      console.log("Chữ ký nhận từ MoMo:", signature);

      // Dữ liệu yêu cầu gửi tới MoMo
      const requestBody = {
        partnerCode,
        accessKey,
        requestId,
        amount,
        orderId: order._id.toString(),
        orderInfo,
        redirectUrl,
        ipnUrl,
        extraData,
        requestType,
        signature,
        lang: "vi",
      };

      // Gửi yêu cầu tới MoMo API
      const response = await axios.post(
        "https://test-payment.momo.vn/v2/gateway/api/create",
        requestBody,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Trả về URL thanh toán
      return res.status(200).json({
        payUrl: response.data.payUrl,
        message: "Tạo thanh toán thành công",
      });
    } catch (error) {
      console.error("Lỗi khi tạo thanh toán MoMo:", error);

      // Trả về lỗi nếu có
      return res.status(500).json({
        message: "Lỗi khi tạo thanh toán MoMo",
        error: error.response?.data || error.message,
      });
    }
  };

  // Xử lý IPN (Thông báo thanh toán từ MoMo)
  handleMomoIPN = async (req, res) => {
    const { orderId, amount, signature, resultCode } = req.body;

    try {
      // Kiểm tra xem các tham số có hợp lệ không
      if (!orderId || !amount || !signature || !resultCode) {
        return res.status(400).json({ message: "Thiếu tham số yêu cầu" });
      }

      // Khóa bí mật dùng để kiểm tra chữ ký
      const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";

      // Tạo chuỗi raw signature từ các tham số nhận được
      const rawSignature = `amount=${amount}&orderId=${orderId}&resultCode=${resultCode}`;

      // Tạo chữ ký từ chuỗi raw signature
      const generatedSignature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature)
        .digest("hex");

      console.log("Generated Signature:", generatedSignature); // Xem chữ ký đã tạo

      // Kiểm tra chữ ký
      if (generatedSignature !== signature) {
        return res.status(400).json({ message: "Chữ ký không hợp lệ" });
      }

      // Xử lý kết quả thanh toán
      const orderUpdate =
        resultCode === 0
          ? { orderStatus: "confirmed" } // Thanh toán thành công
          : { orderStatus: "canceled" }; // Thanh toán thất bại

      // Cập nhật trạng thái đơn hàng
      await Order.findByIdAndUpdate(orderId, orderUpdate);

      // Trả kết quả xác minh
    return res.status(200).json({
        message: resultCode === "0" ? "Thanh toán thành công" : "Thanh toán thất bại",
       
      });
    } catch (error) {
      console.error("Lỗi trong xử lý MoMo IPN:", error);
      return res.status(500).json({ message: "Lỗi xử lý thông báo từ MoMo" });
    }
  };
}

export default MomoController;
