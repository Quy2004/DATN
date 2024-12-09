import mongoose from "mongoose";
import axios from "axios";
import crypto from "crypto-browserify";
import Order from "../models/OderModel";
import Cart from "../models/Cart";
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
    const redirectUrl = "http://localhost:5173/order-result";
    const cancelUrl = encodeURIComponent("http://localhost:5173/order-error");
    const ipnUrl = "https://94b2-113-189-171-22.ngrok-free.app/payments/momo/notify"; //lưu ý thay đường dẫn ngrok mới nhất 
    const amount = order.totalPrice.toString(); // Chuyển tổng giá trị đơn hàng thành chuỗi
    const requestType = "captureWallet";
    const extraData = ""; // Dữ liệu bổ sung (tuỳ chọn)

    // Tạo chuỗi raw signature
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
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
      cancelUrl,  // Thêm cancelUrl vào request body
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
    const { orderId, resultCode } = req.body;
  
    try {
      // Log thông tin nhận được
      console.log('Received IPN Data:', { 
          orderId, 
          resultCode,
      });
  
      // Kiểm tra tính hợp lệ của orderId
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
          return res.status(400).json({ 
              message: "ID đơn hàng không hợp lệ" 
          });
      }
  
      // Xác định trạng thái paymentStatus dựa trên resultCode
      const newPaymentStatus = 
          resultCode === 0 
              ? "paid"   // Thanh toán thành công
              : "failed";   // Thanh toán thất bại
  
      // Cập nhật chỉ paymentStatus của đơn hàng
      const updatedOrder = await Order.findByIdAndUpdate(
          orderId, 
          { 
              paymentStatus: newPaymentStatus 
          }, 
          { 
              new: true,           // Trả về document mới
              runValidators: true  // Chạy validators
          });
  
      // Kiểm tra xem đơn hàng có tồn tại không
      if (!updatedOrder) {
          return res.status(404).json({ 
              message: "Không tìm thấy đơn hàng" 
          });
      }
      if (resultCode === 0) {
        await Cart.findOneAndDelete({ userId: updatedOrder.user_id});
    }
      // Nếu thanh toán thất bại, trả về cancelUrl cho người dùng
      if (resultCode !== 0) {
          return res.status(200).json({
              message: "Thanh toán thất bại, đơn hàng đã bị hủy",
             cancelUrl: "http://localhost:5173/order-error" // Chuyển hướng tới trang lỗi
          });
      }
  
      // Trả về phản hồi thành công khi thanh toán thành công
      return res.status(200).json({
          message: resultCode === 0 
              ? "Cập nhật trạng thái thanh toán đơn hàng thành công" 
              : "Thanh toán đơn hàng thất bại",
          order: {
              id: updatedOrder._id,
              paymentStatus: updatedOrder.paymentStatus
          }
      });
  
    } catch (error) {
        console.error('Lỗi cập nhật trạng thái thanh toán đơn hàng:', error);
        return res.status(500).json({ message: "Lỗi xử lý", errorDetails: error.message });
    }
  };
  

}

export default MomoController;
