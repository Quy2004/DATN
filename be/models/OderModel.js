import mongoose from "mongoose";

// Hàm để sinh orderNumber bao gồm cả chữ và số
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const randomLetters = Math.random().toString(36).substring(2, 5).toUpperCase(); // Tạo 3 chữ cái ngẫu nhiên
  const randomNumbers = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0"); // Tạo 3 chữ số ngẫu nhiên
  return `${randomLetters}-${timestamp}-${randomNumbers}`;
};

// Khai báo orderSchema
const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
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
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",         // Chờ xác nhận
        "confirmed",       // Đã xác nhận
        "shipping",        // Đang giao hàng
        "delivered",       // Đã giao hàng
        "completed",       // Đã hoàn thành
        "canceled",        // Đã hủy
      ],
      default: "pending",
    },
    orderDetail_id: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderDetail", 
    }],
    paymentMethod: {
      type: String,
      enum: ["bank transfer", "cash on delivery"],
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

// Tạo pre-save hook
orderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    this.orderNumber = generateOrderNumber();
  }
  next();
});

// Xuất mô hình Order
export default mongoose.model("Order", orderSchema);
