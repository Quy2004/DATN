import mongoose from "mongoose";
const Schema = mongoose.Schema;

const VoucherSchema = new Schema(
  {
    name:{
      type: String,
      required: true,
    },
    code: {
      type: String,
    },
    discription:{
      type: String,
    },
    discountPercentage: {
      type: Number,
      required: true,
    },
    maxDiscount:{
      type: Number,
    },
    quantity: {
      type: Number,
      required: true,
    },
    minOrderDate: {
      type: Date,
      required: true,
      validate:{
        validator: function(value) {
          return value >= new Date();
        },
        message: "Ngày bắt đầu không được trước thời điểm hiện tại."
      }
    },
    maxOrderDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Voucher = mongoose.model("vouchers", VoucherSchema);
export default Voucher;
