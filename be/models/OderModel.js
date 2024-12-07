import mongoose from "mongoose";

// Hàm để sinh orderNumber bao gồm cả chữ và số
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const randomLetters = Math.random()
    .toString(36)
    .substring(2, 5)
    .toUpperCase(); 
  const randomNumbers = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0"); 
  return `${randomLetters}-${timestamp}-${randomNumbers}`;
};

// Khai báo orderSchema
const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerInfo: {
      name: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    discountAmount: {
      type: Number,
      required: false,
      default: 0, 
    },
    orderStatus: {
      type: String,
      enum: [
        "pending", // Chờ xác nhận
       
        "confirmed", // Đã xác nhận
        "shipping", // Đang giao hàng
        "delivered", // Đã giao hàng
        "completed", // Đã hoàn thành
        "canceled", // Đã hủy
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: [
        "unpaid",
        'pending',      // Chưa thanh toán
        "paid",        // Đã thanh toán
        "failed",      // Thanh toán thất bại
       
      ],
      default: "unpaid",
    },
    
    orderDetail_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrderDetail",
      },
    ],
    paymentMethod: {
      type: String,
      enum: ["bank transfer", "cash on delivery", "momo","zalopay"],
      required: true 
    },
    paymentTransactionId: {
      type: String,
      required: false,
    },
    paymentResponseData: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    cancellationReason: {
      type: String,
      required: false,
    },
    orderNumber: {
      type: String,
      required: false,
      unique: true,
    },
    note: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Tạo pre-save hook để sinh orderNumber và tính tổng giá
orderSchema.pre("save", async function (next) {
  // Sinh orderNumber nếu chưa có
  if (!this.orderNumber) {
    this.orderNumber = generateOrderNumber();
  }

  // Tính tổng giá dựa trên orderDetail_id
  if (this.orderDetail_id && this.orderDetail_id.length > 0) {
    try {
      // Lấy các chi tiết đơn hàng
      const orderDetails = await mongoose
        .model("OrderDetail")
        .find({
          _id: { $in: this.orderDetail_id },
        })
        .populate({
          path: "product_id",
          select: "price sale_price discount",
        })
        .populate({
path: "product_size",
          select: "priceSize",
        })
        .populate({
          path: "product_toppings.topping_id",
          select: "priceTopping",
        });

      // Tính tổng giá cho đơn hàng
      const totalPrice = orderDetails.reduce((total, detail) => {
        let productPrice =
          detail.product_id.sale_price || detail.product_id.price;

        let productTotalPrice =
          productPrice + (detail.product_size?.priceSize || 0);

        let toppingsPrice = 0;
        if (detail.product_toppings?.length) {
          for (const topping of detail.product_toppings) {
            toppingsPrice += topping.topping_id.priceTopping || 0;
          }
        }

        productTotalPrice += toppingsPrice;

        return total + productTotalPrice * detail.quantity;
      }, 0);

    
    } catch (error) {
      console.error("Error calculating totalPrice:", error);
    }
  }

  next();
});

// Thêm method để cập nhật trạng thái thanh toán
orderSchema.methods.updatePaymentStatus = function(status, transactionId, responseData) {
  this.paymentStatus = status;
  if (transactionId) this.paymentTransactionId = transactionId;
  if (responseData) this.paymentResponseData = responseData;
  return this.save();
};

// Thêm method để xác nhận đơn hàng
orderSchema.methods.confirmOrder = function() {
  this.orderStatus = "confirmed";
  return this.save();
};

// Thêm method để hủy đơn hàng
orderSchema.methods.cancelOrder = function(reason) {
  this.orderStatus = "canceled";
  this.cancellationReason = reason;
  return this.save();
};

// Xuất mô hình Order
const Order = mongoose.model("Order", orderSchema);
export default Order;