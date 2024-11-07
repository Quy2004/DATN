import Order from "../models/OderModel.js";
import Cart from "../models/Cart.js";
import { createOrderDetail } from "./OrderDetail"; // Import hàm từ file orderDetailController.js

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "orderDetail_id",
        populate: {
          path: "product_id",
          model: "Product",
          select:
            "name category_id price sale_price discount image thumbnail product_sizes product_toppings status",
        },
      })

      .populate({
        path: "user_id",
        select: "userName email",
      });

    if (!orders.length) {
      return res.status(404).json({ message: "Không có đơn hàng nào." });
    }

    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({
      message: "Có lỗi xảy ra, vui lòng thử lại.",
      error: error.message,
    });
  }
};

// Hàm tạo đơn hàng
 export const createOrder = async (req, res) => {
  try {
    const { userId, addressId, payment_id, note = "" } = req.body;
    const cart = await Cart.findOne({ userId }).populate("products.product");

    if (!cart || !cart.products.length) {
      return res.status(400).json({ message: "Giỏ hàng rỗng." });
    }

    const totalPrice = cart.totalprice || 0; // Kiểm tra tồn tại của `totalprice`
    const order = new Order({
      user_id: userId,
      address_id: addressId,
      totalPrice: totalPrice,
      payment_id: payment_id || null,
      orderDetail_id: [],
      orderNumber: "",
      note: note,
      status: "Đang xử lý",
    });

    await order.save();

    const orderDetailsPromises = cart.products.map(async (item) => {
      if (!item.product || !item.product._id || !item.product.price || !item.product.image) {
        throw new Error("Thông tin sản phẩm không đầy đủ.");
      }
      const orderDetail = await createOrderDetail(
        order._id,
        item.product._id,
        item.quantity,
        item.product.price,
        item.product.image
      );
      return orderDetail._id;
    });

    const orderDetailIds = await Promise.all(orderDetailsPromises);
    order.orderDetail_id = orderDetailIds;
    await order.save();

    await Cart.findOneAndDelete({ userId });
    return res.status(201).json({ message: "Đơn hàng đã được tạo thành công.", order });
  } catch (error) {
    console.error("Lỗi tạo đơn hàng:", error);
    return res.status(500).json({
      message: "Có lỗi xảy ra, vui lòng thử lại.",
      error: error.message,
    });
  }
};
; // Lấy danh sách đơn hàng của người dùng
export const getOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ user_id: userId }).populate({
      path: "orderDetail_id", // populate orderDetail_id
      populate: {
        path: "product_id", // populate thêm product_id trong OrderDetail
        model: "Product",
      },
    });

    if (!orders.length) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    return res.status(200).json(orders);
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Có lỗi xảy ra, vui lòng thử lại.",
        error: error.message,
      });
  }
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Cập nhật danh sách các trạng thái hợp lệ
    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "shipping",
      "delivered",
      "completed",
      "canceled",
    ];

    // Kiểm tra trạng thái hợp lệ
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ." });
    }

    // Cập nhật đúng trường `orderStatus`
    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tìm thấy." });
    }

    return res
      .status(200)
      .json({ message: "Cập nhật trạng thái đơn hàng thành công.", order });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Có lỗi xảy ra, vui lòng thử lại.",
        error: error.message,
      });
  }
};
