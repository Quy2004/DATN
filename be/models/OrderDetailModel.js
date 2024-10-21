import mongoose from "mongoose";

const orderDetailSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
  },
  image: { // Thêm trường image
    type: String, // Có thể sử dụng kiểu String cho URL hình ảnh
  },
}, { timestamps: true });

export default mongoose.model("OrderDetail", orderDetailSchema);