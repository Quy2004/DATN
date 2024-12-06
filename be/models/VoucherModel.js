import mongoose from "mongoose";
import cron from "node-cron";

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
        applicableProducts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Products",
            },
        ],
        applicableCategories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
            },
        ],
        status: {
            type: String,
            enum: ["upcoming", "active", "unactive"],
            default: "upcoming",
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Middleware tự động cập nhật trạng thái
VoucherSchema.pre("save", function (next) {
    if (this.quantity === 0 || this.maxOrderDate <= new Date()) {
        this.status = "unactive";
    } else if (this.minOrderDate <= new Date() && this.maxOrderDate > new Date()) {
        this.status = "active";
    }
    next();
});
VoucherSchema.pre('save', function(next) {
    const currentDate = new Date();

    if (this.minOrderDate < currentDate) {
        this.minOrderDate = currentDate; // Cập nhật thành giờ hiện tại nếu minOrderDate trước thời gian hiện tại
    }
    next();
});
// Định nghĩa model
const Voucher = mongoose.model("vouchers", VoucherSchema);

// Hàm cập nhật trạng thái cho các voucher hết hạn
async function checkExpiredVouchers() {
    try {
        const expiredResult = await Voucher.updateMany(
            { maxOrderDate: { $lte: new Date() }, isDeleted: false },
            { status: "unactive" }
        );

        const activeResult = await Voucher.updateMany(
            { minOrderDate: { $lte: new Date() }, maxOrderDate: { $gt: new Date() }, isDeleted: false },
            { status: "active" }
        );

        const inactiveResult = await Voucher.updateMany(
            { maxOrderDate: { $lte: new Date() }, status: "active", isDeleted: false },
            { status: "unactive" }
        );

    } catch (error) {
        console.error("Lỗi khi cập nhật voucher:", error);
    }
}

// Chạy hàm kiểm tra ngay lập tức để kiểm tra hoạt động
checkExpiredVouchers();

// Lên lịch chạy hàm checkExpiredVouchers mỗi phút
cron.schedule('* * * * *', () => {
    // console.log('Kiểm tra các voucher hết hạn...');
    checkExpiredVouchers();
});

export default Voucher;
