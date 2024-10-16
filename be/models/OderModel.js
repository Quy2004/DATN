import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Tham chiếu đến User
  address_id: { type: mongoose.Schema.Types.ObjectId, ref: "Address", required: true }, // Tham chiếu đến Address
  totalPrice: { type: mongoose.Schema.Types.Decimal128, required: true }, // Giá tổng, kiểu Decimal128
  orderStatus: { type: String, enum: ["pending", "completed", "canceled"], default: "pending" }, // Trạng thái đơn hàng
  note: { type: String }, // Ghi chú
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;