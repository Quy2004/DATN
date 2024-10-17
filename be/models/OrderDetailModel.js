import mongoose from "mongoose";
const orderDetailSchema = new mongoose.Schema({
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true }, // Tham chiếu đến đơn hàng
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, // Tham chiếu đến sản phẩm
    topping: { type: String }, // 
    total: { type: mongoose.Schema.Types.Decimal128, required: true }, // Tổng giá cho chi tiết
    size: { type: String }, // Kích thước sản phẩm
    quantity: { type: Number, required: true }, //Sl sản phẩm
 
  }, { timestamps: true });
  
  const OrderDetail = mongoose.model("OrderDetail", orderDetailSchema);
  export default OrderDetail;