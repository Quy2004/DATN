import Order from "../models/OderModel.js";
import Cart from "../models/Cart.js";
import OrderDetail from "../models/OrderDetailModel.js";

// Get all orders with populated data
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
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

    if (!orders?.length) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng nào",
      });
    }

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đơn hàng",
      error: error.message,
    });
  }
};

// Create new order
export const createOrder = async (req, res) => {
  try {
    const { userId, customerInfo, paymentMethod, note } = req.body;

    // Validate required fields
    if (!userId || !customerInfo || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc",
      });
    }

    // Get cart and validate
    const cart = await Cart.findOne({ userId }).populate("products.product");

    if (!cart?.products?.length) {
      return res.status(400).json({
        success: false,
        message: "Giỏ hàng trống",
      });
    }

    // Create order
    const order = new Order({
      user_id: userId,
      customerInfo,
      totalPrice: cart.totalprice || 0,
      paymentMethod,
      note: note || "",
      orderStatus: "pending", // Đặt trạng thái đơn hàng là "pending" nếu thanh toán MoMo
      orderDetail_id: [],
    });

    await order.save();

    // Create order details including size and topping
    const orderDetailPromises = cart.products.map(async (item) => {
      if (!item.product?._id || !item.product?.price) {
        throw new Error("Thông tin sản phẩm không hợp lệ");
      }

      // Lấy thông tin size và topping từ giỏ hàng
      const product_size = item.product_sizes; // Size
      const product_toppings = item.product_toppings; // Topping

      // Tạo chi tiết đơn hàng
      const orderDetail = new OrderDetail({
        order_id: order._id,
        product_id: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
        sale_price: item.product.sale_price,
        image: item.product.image,
        product_size,
        product_toppings,
      });

      await orderDetail.save();
      return orderDetail._id;
    });

    // Lưu tất cả chi tiết đơn hàng
    const orderDetailIds = await Promise.all(orderDetailPromises);
    order.orderDetail_id = orderDetailIds;
    await order.save();

    // Clear cart after order created
    await Cart.findOneAndDelete({ userId });

    // Nếu phương thức thanh toán là MoMo
    if (paymentMethod === "momo") {
      try {
        // Gửi yêu cầu thanh toán MoMo và nhận URL thanh toán
        const paymentResponse = await axios.post(
          "http://localhost:8000/payments/momo/create-payment",
          {
            orderId: order._id, // Sử dụng orderId của đơn hàng đã tạo
          }
        );

        // Lấy URL thanh toán từ phản hồi
        const { payUrl } = paymentResponse.data;

        return res.status(201).json({
          success: true,
          message: "Tạo đơn hàng thành công",
          data: order,
          payUrl, // Trả về URL thanh toán MoMo cho frontend
        });
      } catch (paymentError) {
        console.error(
          "Lỗi khi tạo thanh toán MoMo",
          paymentError.response?.data || paymentError.message
        );
        return res.status(500).json({
          success: false,
          message: "Lỗi khi tạo thanh toán MoMo",
          error: paymentError.message,
        });
      }
    }

    // Trả về kết quả tạo đơn hàng nếu không phải MoMo
    return res.status(201).json({
      success: true,
      message: "Tạo đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tạo đơn hàng",
      error: error.message,
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
        message: "UserId là bắt buộc",
      });
    }

    const orders = await Order.find({ user_id: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "orderDetail_id",
        populate: [
          {
            path: "product_id",
            model: "Product",
          },
          {
            path: "product_size",
            model: "Size",
          },
          {
            path: "product_toppings.topping_id",
            model: "Topping",
          },
        ],
      });

    if (!orders?.length) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng nào",
      });
    }

    // Tính toán tổng giá cho mỗi đơn hàng
    const updatedOrders = await Promise.all(
      orders.map(async (order) => {
        let totalPrice = 0;

        // Lặp qua các chi tiết đơn hàng
        for (const orderDetail of order.orderDetail_id) {
          const { product_id, quantity, product_size, product_toppings } =
            orderDetail;

          // Giá gốc của sản phẩm sau khi áp dụng giảm giá
          const productPrice = product_id.sale_price || product_id.price;

          // Tính giá của sản phẩm bao gồm size
          let productTotalPrice = productPrice + (product_size?.priceSize || 0);

          // Tính giá của toppings
          let toppingsPrice = 0;
          if (product_toppings?.length) {
            for (const topping of product_toppings) {
              const toppingPrice = topping.topping_id.priceTopping || 0;
              toppingsPrice += toppingPrice;
            }
          }

          productTotalPrice += toppingsPrice;

          totalPrice += productTotalPrice * quantity;
        }

        // Cập nhật tổng giá của đơn hàng
        order.totalPrice = totalPrice;

        return order;
      })
    );

    return res.status(200).json({
      success: true,
      data: updatedOrders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy đơn hàng",
      error: error.message,
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
      "shipping",
      "delivered",
      "completed",
      "canceled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái đơn hàng không hợp lệ",
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
        message: "Không tìm thấy đơn hàng",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật trạng thái",
      error: error.message,
    });
  }
};
// Hủy đơn hàng
export const cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Đơn hàng không tồn tại.",
      });
    }

    if (order.orderStatus === "canceled") {
      return res.status(400).json({
        success: false,
        message: "Đơn hàng đã được hủy trước đó.",
      });
    }

    order.orderStatus = "canceled";
    order.cancellationReason = reason || "Không có lý do cụ thể.";

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Hủy đơn hàng thành công.",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi hủy đơn hàng.",
      error: error.message,
    });
  }
};
