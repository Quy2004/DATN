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
		// phần trăm giảm giá
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

// Middleware để tự động cập nhật isDeleted trước khi lưu
VoucherSchema.pre('save', function (next) {
	if (this.quantity === 0 || this.maxOrderDate <= new Date()) {
		this.isDeleted = true;
	}
	next();
});

// Phương thức để kiểm tra và cập nhật isDeleted
VoucherSchema.methods.checkAndUpdateStatus = function () {
	if (this.quantity === 0 || this.maxOrderDate <= new Date()) {
		this.isDeleted = true;
	}
};

const Voucher = mongoose.model("vouchers", VoucherSchema);
export default Voucher;
