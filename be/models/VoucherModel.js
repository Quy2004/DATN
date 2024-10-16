import mongoose from "mongoose";
const Schema = mongoose.Schema;

const VoucherSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		code: {
			type: String,
		},
		description: {
			type: String,
		},
		// phaàn trăm giảm giá
		discountPercentage: {
			type: Number,
			required: true,
		},
		// giảm giá tối đa
		maxDiscount: {
			type: Number,
		},
		quantity: {
			type: Number,
			required: true,
		},
		// ngày bắt đầu
		minOrderDate: {
			type: Date,
			required: true,
			validate: {
				validator: function (value) {
					return value >= new Date();
				},
				message: "Ngày bắt đầu không được trước thời điểm hiện tại.",
			},
		},
		// ngày kết thúc
		maxOrderDate: {
			type: Date,
			required: true,
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

const Voucher = mongoose.model("vouchers", VoucherSchema);
export default Voucher;
