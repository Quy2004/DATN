import Order from "../models/OderModel.js";
import Cart from "../models/Cart.js";
import { createOrderDetail } from "./OrderDetail.js";

// Get all orders with populated data
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "orderDetail_id",
        populate: {
          path: "product_id",
          model: "Product",
          select: "name category_id price sale_price discount image thumbnail product_sizes product_toppings status"
        }
      })
      .populate({
        path: "user_id",
        select: "userName email"
      })
      .populate("address_id");

    if (!orders?.length) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng nào"
      });
    }

    return res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đơn hàng",
      error: error.message
    });
  }
};

// Create new order
export const createOrder = async (req, res) => {
  try {
    const { userId, addressId, paymentMethod, note } = req.body;

    // Validate required fields
    if (!userId || !addressId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc"
      });
    }

    // Get cart and validate
    const cart = await Cart.findOne({ userId }).populate("products.product");
    
    if (!cart?.products?.length) {
      return res.status(400).json({
        success: false,
        message: "Giỏ hàng trống"
      });
    }

    // Create order
    const order = new Order({
      user_id: userId,
      address_id: addressId,
      totalPrice: cart.totalprice || 0,
      paymentMethod,
      note: note || "",
      orderStatus: "pending",
      orderDetail_id: []
    });

    await order.save();

    // Create order details
    const orderDetailPromises = cart.products.map(async (item) => {
      if (!item.product?._id || !item.product?.price) {
        throw new Error("Thông tin sản phẩm không hợp lệ");
      }

      const orderDetail = await createOrderDetail({
        orderId: order._id,
        productId: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
        image: item.product.image
      });

      return orderDetail._id;
    });

    const orderDetailIds = await Promise.all(orderDetailPromises);
    order.orderDetail_id = orderDetailIds;
    await order.save();

    // Clear cart after order created
    await Cart.findOneAndDelete({ userId });

    return res.status(201).json({
      success: true,
      message: "Tạo đơn hàng thành công",
      data: order
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tạo đơn hàng",
      error: error.message
    });
  }
};

// Get orders by user ID
export const getOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId là bắt buộc"
      });
    }

    const orders = await Order.find({ user_id: userId })
      .populate({
        path: "orderDetail_id",
        populate: {
          path: "product_id",
          model: "Product"
        }
      })
      .populate("address_id");

    if (!orders?.length) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng nào"
      });
    }

    return res.status(200).json({
      success: true,
      data: orders
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy đơn hàng",
      error: error.message
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate order status
    const validStatuses = [
      "pending",
      "confirmed", 
      "preparing",
      "shipping",
      "delivered",
      "completed",
      "canceled"
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái đơn hàng không hợp lệ"
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: order
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật trạng thái",
      error: error.message
    });
  }
};