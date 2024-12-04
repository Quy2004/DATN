import mongoose from "mongoose";

const Schema = mongoose.Schema;

const NotificationSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Tiêu đề không được để trống"],
      trim: true, // Loại bỏ khoảng trắng thừa
    },
    message: {
      type: String,
      required: [true, "Nội dung thông báo không được để trống"],
      trim: true, // Loại bỏ khoảng trắng thừa
    },
    image: {
      type: String,
      default: null, // Lưu URL của hình ảnh, mặc định là null
    },
    user_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Liên kết đến người dùng, mặc định là null nếu thông báo không dành cho ai
    },
    order_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null, // Liên kết đến người dùng, mặc định là null nếu thông báo không dành cho ai
    },
    product_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null, // Liên kết đến người dùng, mặc định là null nếu thông báo không dành cho ai
    },
    type: {
      type: String,
      enum: ["product", "voucher", "general"],
      required: true, // Loại thông báo: sản phẩm, voucher hoặc chung
    },
    isRead: {
      type: Boolean,
      default: false, // Mặc định là chưa đọc
    },
    isGlobal: {
      type: Boolean,
      default: false, // Mặc định là không phải thông báo toàn cầu
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active", // Trạng thái của thông báo: hoạt động hoặc không hoạt động
    },
    createdAt: {
      type: Date,
      default: Date.now, // Thời gian tạo thông báo
    },
  },
  {
    timestamps: true, // Tự động tạo trường updatedAt khi có sự thay đổi    
    versionKey: false,
  }
);

const NotificationModel = mongoose.model("Notification", NotificationSchema);

export default NotificationModel;
