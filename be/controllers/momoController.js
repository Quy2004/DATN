import mongoose from "mongoose";
import axios from "axios";
import crypto from "crypto-browserify";
import Order from "../models/OderModel";
import Cart from "../models/Cart";
import OrderDetailModel from "../models/OrderDetailModel";
import NotificationModel from "../models/NotificationModel";
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
    const ipnUrl = "https://e759-42-117-78-66.ngrok-free.app/payments/momo/notify"; //lưu ý thay đường dẫn ngrok mới nhất 
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

        const newPaymentStatus = resultCode === 0 ? "paid" : "failed";

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId, 
            { paymentStatus: newPaymentStatus }, 
            { new: true, runValidators: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ 
                message: "Không tìm thấy đơn hàng" 
            });
        }

        // Nếu thanh toán thành công
        if (resultCode === 0) {
            console.log('Đơn hàng được thanh toán:', updatedOrder);

    // Tạo thông báo đặt hàng thành công
    const notification = new NotificationModel({
        title: "Đặt hàng thành công",
        message: `Đơn hàng mã "${orderId}" của bạn đã được đặt thành công với phương thức thanh toán Momo. Trạng thái đơn hàng: đã được thanh toán.`,
        message2 : `âjaj`,
        user_Id: updatedOrder?.user_id || null,
        order_Id: orderId,
        type: "general", // Giá trị hợp lệ
        isGlobal: false,
    });

    try {
        await notification.save();
        console.log("Thông báo được lưu thành công.");
    } catch (err) {
        console.error("Lỗi khi lưu thông báo:", err.message);
    }
            // Tìm giỏ hàng của user
            const cart = await Cart.findOne({ userId: updatedOrder.user_id });
            console.log('Giỏ hàng trước khi cập nhật:', cart);

            if (cart && cart.products.length > 0) {
                // Lấy danh sách sản phẩm từ orderDetail_id
                const orderDetails = await OrderDetailModel.find({ _id: { $in: updatedOrder.orderDetail_id } });
                console.log('Sản phẩm đã đặt:', orderDetails);

                // Xóa sản phẩm khỏi giỏ hàng
                for (const detail of orderDetails) {
                    const productId = detail.product_id;
                    const size = detail.product_size; // Sử dụng product_size từ orderDetail
                    const toppings = detail.product_toppings || []; // Toppings của sản phẩm

                    console.log(`Processing Product ID: ${productId}, Size: ${size}, Toppings:`, toppings);

                    // Kiểm tra trường hợp sản phẩm có topping hay không
                    if (toppings.length > 0) {
                        // Nếu có topping, xóa sản phẩm theo product_id, size và topping
                        const result = await Cart.updateMany(
                            { userId: updatedOrder.user_id },
                            {
                                $pull: {
                                    products: {
                                        product: productId,
                                        product_sizes: size, // Xóa theo size
                                        product_toppings: { $in: toppings }, // Xóa theo topping nếu có
                                    },
                                },
                            }
                        );
                        console.log("Cart Update Result with Toppings:", result);
                    } else {
                        // Nếu không có topping, xóa sản phẩm theo product_id và size
                        const result = await Cart.updateMany(
                            { userId: updatedOrder.user_id },
                            {
                                $pull: {
                                    products: {
                                        product: productId,
                                        product_sizes: size, // Xóa theo size
                                        product_toppings: { $size: 0 }, // Không có topping
                                    },
                                },
                            }
                        );
                        console.log("Cart Update Result without Toppings:", result);
                    }
                }
            }
        }

        if (resultCode !== 0) {
            return res.status(200).json({
                message: "Thanh toán thất bại, đơn hàng đã bị hủy",
                cancelUrl: "http://localhost:5173/order-error"
            });
        }

        return res.status(200).json({
            message: resultCode === 0 ? 
                "Cập nhật trạng thái thanh toán đơn hàng thành công" : 
                "Thanh toán đơn hàng thất bại",
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
