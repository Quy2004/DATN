import mongoose from "mongoose";

// Hàm để sinh orderNumber
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${timestamp}-${random}`;
};

// Khai báo orderSchema
const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    address_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    totalPrice: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ["pending", "completed", "canceled"],
      default: "pending",
    },
    // orderDetail_id: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "OrderDetail", 
    //   required: true,
    // },
    payment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: false,
    },
    orderNumber: {
      type: String,
      required: false,
      unique: true,
    },
    note: {
      // Thêm trường note
      type: String,
      required: false, 
    },
  },
  { timestamps: true }
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
