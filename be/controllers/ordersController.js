import Order from "../models/OderModel.js";
import Cart from "../models/Cart.js";
import OrderDetail from "../models/OrderDetailModel.js";
import axios from "axios";
import NotificationModel from "../models/NotificationModel.js";

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
    const {
      userId,
      customerInfo,
      paymentMethod,
      totalPrice,
      note,
      discountAmount,
      cartItems,
    } = req.body;
    // Validate required fields
    if (!userId || !customerInfo || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc",
      });
    }

    // Get cart and validate
    const cart = cartItems;
    // const cart = await Cart.findOne({ userId }).populate("products.product");

    if (!cart?.products?.length) {
      return res.status(400).json({
        success: false,
        message: "Giỏ hàng trống",
      });
    }

    // Create order
    const order = new Order({
      user_id: userId || null, // Null nếu không đăng nhập
      customerInfo,
      totalPrice,
      discountAmount, // Lưu thông tin giảm giá
      paymentMethod,
      note: note || "",
      paymentStatus:
        paymentMethod === "cash on delivery" ? "pending" : "unpaid", // Trạng thái ban đầu là unpaid
      orderDetail_id: [],
    });
    const notification = new NotificationModel({
      title: "Đặt hàng thành công",
      message: `Đơn hàng mã "${
        order._id
      }" của bạn đã được đặt thành công và đang chờ xử lý. Trạng thái hiện tại: "${
        paymentMethod === "cash on delivery"
          ? "Đang chờ xử lý"
          : "Chưa thanh toán"
      }".`,
      user_Id: userId || null, // Null nếu không đăng nhập
      order_Id: order._id, // Gắn ID đơn hàng để tiện theo dõi
      type: "general",
      isGlobal: false, // Chỉ thông báo cho người dùng liên quan
    });

    await notification.save();
    await order.save();
    console.log(`Đơn hàng ${order._id} được tạo. Thiết lập xóa sau 5 phút...`);

    setTimeout(async () => {
      const foundOrder = await Order.findById(order._id);

      // Kiểm tra nếu đơn hàng tồn tại và trạng thái thanh toán là "failed" nhưng không phải phương thức COD
      if (foundOrder) {
        // Nếu là COD, không thực hiện xóa
        if (foundOrder.paymentMethod === "cash on delivery") {
          console.log(
            `Đơn hàng ${order._id} không bị xóa vì phương thức thanh toán là COD.`
          );
        } else if (foundOrder.paymentStatus === "failed") {
          console.log(`Đơn hàng ${order._id} đang bị xóa...`);

          // Thực hiện xóa đơn hàng và chi tiết
          await Order.findByIdAndDelete(order._id);
          await OrderDetail.deleteMany({ order_id: order._id });

          console.log(`Đơn hàng ${order._id} đã bị xóa.`);
        } else {
          console.log(
            `Đơn hàng ${order._id} không ở trạng thái failed hoặc cancel.`
          );
        }
      } else {
        console.log(`Không tìm thấy đơn hàng với ID ${order._id}`);
      }
    }, 5 * 60 * 1000); // 5 phút = 300.000ms
    // Create order details including size and topping
    const orderDetailPromises = cart.products.map(async (item) => {
      if (!item.product?._id || !item.product?.price) {
        throw new Error("Thông tin sản phẩm không hợp lệ");
      }

      const product_size = item.product_sizes;
      const product_toppings = item.product_toppings;

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

    // Xóa giỏ hàng theo điều kiện phương thức thanh toán
    if (paymentMethod === "cash on delivery") {
      // Nếu là thanh toán khi nhận hàng, xóa  nhung san pham da mua theo product id
      const productIds = cartItems.products.map(item => (item.product._id))
      if (Array.isArray(productIds) && productIds.length > 0) {
        try {
          // Xóa các sản phẩm trong giỏ hàng của userId
          const result = await Cart.updateOne(
            { userId: userId }, // Tìm giỏ hàng theo userId
            {
              $pull: {
                products: {
                  product: { $in: productIds }, // Loại bỏ các sản phẩm đã mua
                },
              },
            }
          );
        } catch (error) {
          console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
        }
      }
    }

    // Nếu phương thức thanh toán là MoMo
    if (paymentMethod === "momo") {
      try {
        const paymentData = {
          orderId: order._id.toString(),
          amount: Math.round(order.totalPrice),
          orderInfo: `Thanh toán đơn hàng ${order._id}`,
        };

        const paymentResponse = await axios.post(
          "http://localhost:8000/payments/momo/create-payment",
          paymentData
        );

        const { payUrl } = paymentResponse.data;

        order.paymentStatus = "unpaid";
        await order.save();
        return res.status(201).json({
          success: true,
          message: "Tạo đơn hàng thành công",
          data: order,
          payUrl,
        });
      } catch (paymentError) {
        // Nếu tạo thanh toán MoMo thất bại, hủy đơn hàng
        await Order.findByIdAndDelete(order._id);
        await OrderDetail.deleteMany({ order_id: order._id });

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

    // Nếu phương thức thanh toán là ZaloPay
    if (paymentMethod === "zalopay") {
      try {
        const paymentData = {
          orderId: order._id.toString(),
          amount: Math.round(order.totalPrice),
          orderInfo: `Thanh toán đơn hàng ${order._id}`,
        };

        const paymentResponse = await axios.post(
          "http://localhost:8000/payments/zalo/create-payment",
          paymentData
        );

        const { payUrl } = paymentResponse.data;

        return res.status(201).json({
          success: true,
          message: "Tạo đơn hàng thành công",
          data: order,
          payUrl,
        });
      } catch (paymentError) {
        // Nếu tạo thanh toán ZaloPay thất bại, hủy đơn hàng
        await Order.findByIdAndDelete(order._id);
        await OrderDetail.deleteMany({ order_id: order._id });

        console.error(
          "Lỗi khi tạo thanh toán ZaloPay",
          paymentError.response?.data || paymentError.message
        );
        return res.status(500).json({
          success: false,
          message: "Lỗi khi tạo thanh toán ZaloPay",
          error: paymentError.message,
        });
      }
    }
    // Nếu phương thức thanh toán là VnPay
    if (paymentMethod === "vnpay") {
      try {
        // Thông tin thanh toán VnPay
        const paymentData = {
          amount: Math.round(order.totalPrice), // Làm tròn số tiền,
          bankCode: "",
          language: "vn",
          orderId: order._id.toString(),
        };

        // Gửi yêu cầu thanh toán VnPay
        const paymentResponse = await axios.post(
          "http://localhost:8888/order/create_payment_url",
          paymentData
        );

        // Lấy URL thanh toán từ phản hồi
        const payUrl = paymentResponse.data.vnp_url;

        return res.status(201).json({
          success: true,
          message: "Tạo đơn hàng thành công",
          data: order,
          payUrl, // Trả về URL thanh toán VnPay cho frontend
        });
      } catch (paymentError) {
        // Nếu tạo thanh toán VnPay thất bại, hủy đơn hàng
        await Order.findByIdAndDelete(order._id);
        await OrderDetail.deleteMany({ order_id: order._id });

        console.error(
          "Lỗi khi tạo thanh toán VnPay",
          paymentError.response?.data || paymentError.message
        );
        return res.status(500).json({
          success: false,
          message: "Lỗi khi tạo thanh toán VnPay",
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
    console.log("creatr order", error);
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
const statusMapping = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  completed: "Hoàn thành",
  canceled: "Hủy đơn",
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Kiểm tra trạng thái hợp lệ
    const validStatuses = Object.keys(statusMapping);

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

    // Lấy trạng thái tiếng Việt từ mapping
    const vietnameseStatus = statusMapping[status];

    // Tạo thông báo mới sử dụng trạng thái tiếng Việt
    const notification = await NotificationModel.create({
      title: "Trạng thái đơn hàng đã được cập nhật",
      message: `Đơn hàng mã "${order.orderNumber}" của bạn hiện đã chuyển sang trạng thái: "${vietnameseStatus}".`,
      user_Id: order.user_id, // Lấy userId từ bảng Order
      order_Id: order._id, // Lấy userId từ bảng Order
      type: "general",
      isGlobal: true,
    });

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: {
        order,
        notification, // Trả về thông báo mới tạo (tùy chọn)
      },
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
// Get order By Id
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId là bắt buộc",
      });
    }
    const order = await Order.findOne({ _id: orderId }).populate({
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

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng nào",
      });
    }
    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy đơn hàng",
      error: error.message,
    });
  }
};
// Get total revenue and order count
export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { orderStatus: { $ne: "canceled" } } }, // Exclude canceled orders
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.totalRevenue || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi thống kê đơn hàng",
      error: error.message,
    });
  }
};

// Get order status distribution
export const getOrderStatusDistribution = async (req, res) => {
  try {
    const statusDistribution = await Order.aggregate([
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      data: statusDistribution,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi thống kê trạng thái đơn hàng",
      error: error.message,
    });
  }
};

// Get top products by sales volume
export const getTopProducts = async (req, res) => {
  try {
    const topProducts = await OrderDetail.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "product_info",
        },
      },
      { $unwind: "$product_info" },
      {
        $group: {
          _id: "$product_id",
          totalQuantity: { $sum: "$quantity" },
          productName: { $first: "$product_info.name" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }, // Get top 10 products
    ]);

    return res.status(200).json({
      success: true,
      data: topProducts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi thống kê sản phẩm",
      error: error.message,
    });
  }
};

export const getCustomerStats = async (req, res) => {
  try {
    const customerStats = await Order.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user_info",
        },
      },
      { $unwind: "$user_info" },
      {
        $lookup: {
          from: "orderDetails",
          localField: "_id",
          foreignField: "order_id",
          as: "order_details",
        },
      },
      {
        $group: {
          _id: "$user_id",
          userName: { $first: "$user_info.userName" },
          email: { $first: "$user_info.email" },
          phone: { $first: "$user_info.phone" },
          address: { $first: "$user_info.address" },
          totalSpent: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 },
          orders: {
            $push: {
              orderId: "$_id",
              orderNumber: "$orderNumber",
              totalPrice: "$totalPrice",
              orderStatus: "$orderStatus",
              paymentStatus: "$paymentStatus",
              createdAt: "$createdAt",
              details: "$order_details",
            },
          },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }, // Top 10 khách hàng theo chi tiêu
    ]);

    return res.status(200).json({
      success: true,
      data: customerStats,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu đầu vào không hợp lệ",
        error: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Lỗi khi thống kê khách hàng",
      error: error.message,
    });
  }
};

// Get revenue by time period (e.g., daily, weekly, monthly)
export const getRevenueByTimePeriod = async (req, res) => {
  try {
    const { period } = req.query; // "daily", "weekly", "monthly"
    let groupBy;

    switch (period) {
      case "weekly":
        groupBy = { $week: "$createdAt" }; // Group by week number
        break;
      case "monthly":
        groupBy = { $month: "$createdAt" }; // Group by month
        break;
      case "daily":
      default:
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }; // Group by date
    }

    const revenueData = await Order.aggregate([
      { $match: { orderStatus: { $ne: "canceled" } } }, // Exclude canceled orders
      {
        $group: {
          _id: groupBy,
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } }, // Sort by time period
    ]);

    return res.status(200).json({
      success: true,
      data: revenueData,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu đầu vào không hợp lệ",
        error: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Lỗi khi thống kê doanh thu",
      error: error.message,
    });
  }
};
export const getEnhancedOrderStats = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query; // Optional date range filtering

    // Build the match stage for date filtering if provided
    const matchStage = {};
    if (fromDate && toDate) {
      matchStage.createdAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    const stats = await Order.aggregate([
      { $match: { ...matchStage, orderStatus: { $ne: "canceled" } } }, // Exclude canceled orders and apply date filter
      {
        $facet: {
          // Use facet to calculate multiple metrics in one aggregation
          totalRevenue: [
            { $group: { _id: null, total: { $sum: "$totalPrice" } } },
          ],
          averageOrderValue: [
            {
              $group: {
                _id: null,
                avg: { $avg: "$totalPrice" },
              },
            },
          ],
          totalOrders: [{ $group: { _id: null, count: { $sum: 1 } } }],
          orderCountByStatus: [
            { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }, // Sort by status alphabetically
          ],
          revenueByPaymentMethod: [
            {
              $group: {
                _id: "$paymentMethod",
                total: { $sum: "$totalPrice" },
              },
            },
          ],
          topSellingProducts: [
            {
              $unwind: "$orderDetail_id",
            },
            {
              $lookup: {
                from: "orderdetails", // Assuming your order details collection is named "orderdetails"
                localField: "orderDetail_id",
                foreignField: "_id",
                as: "order_details",
              },
            },
            {
              $unwind: "$order_details",
            },
            {
              $lookup: {
                from: "products", // Assuming your products collection is named "products"
                localField: "order_details.product_id",
                foreignField: "_id",
                as: "product_info",
              },
            },
            { $unwind: "$product_info" },
            {
              $group: {
                _id: "$product_info._id",
                productName: { $first: "$product_info.name" },
                totalQuantitySold: { $sum: "$order_details.quantity" },
                totalRevenue: {
                  $sum: {
                    $multiply: [
                      "$order_details.quantity",
                      "$order_details.price",
                    ],
                  },
                },
              },
            },
            { $sort: { totalQuantitySold: -1 } },
            { $limit: 5 }, // Top 5 selling products
          ],
        },
      },
    ]);

    const result = {
      totalRevenue: stats[0].totalRevenue[0]?.total || 0,
      averageOrderValue: stats[0].averageOrderValue[0]?.avg || 0,
      totalOrders: stats[0].totalOrders[0]?.count || 0,
      orderCountByStatus: stats[0].orderCountByStatus,
      revenueByPaymentMethod: stats[0].revenueByPaymentMethod,
      topSellingProducts: stats[0].topSellingProducts,
    };

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi thống kê đơn hàng chi tiết",
      error: error.message,
    });
  }
};
export const getCompletedOrders = async (req, res) => {
  try {
    // Tìm các đơn hàng đã hoàn thành và sắp xếp theo ngày tạo
    const orders = await Order.find({ orderStatus: "completed" })
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
      })
      .populate({
        path: "user_id",
        select: "userName email",
      });

    // Kiểm tra xem có đơn hàng nào không
    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng nào đã hoàn thành.",
      });
    }

    // Trả về danh sách đơn hàng đã hoàn thành
    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    // Log lỗi để dễ dàng kiểm tra
    console.error("Error fetching completed orders:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đơn hàng đã hoàn thành.",
      error: error.message,
    });
  }
};
export const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Kiểm tra trạng thái thanh toán hợp lệ
    const validPaymentStatuses = ["pending", "paid", "failed"];

    if (!validPaymentStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái thanh toán không hợp lệ",
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // Mapping trạng thái thanh toán sang tiếng Việt
    const paymentStatusMapping = {
      pending: "Đang chờ xử lý",
      paid: "Đã thanh toán",
      failed: "Thanh toán thất bại",
    };

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thanh toán thành công",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật trạng thái thanh toán",
      error: error.message,
    });
  }
};
