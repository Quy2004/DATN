import mongoose from "mongoose";

const Schema = mongoose.Schema;

const addressSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "Users", // Khóa ngoại tham chiếu đến User
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    address: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["primary", "secondary"],
        default: "primary",
    },
});

// Middleware để kiểm tra và thiết lập trạng thái cho địa chỉ mới
addressSchema.pre("save", async function (next) {
    const Address = mongoose.model("Address");

    // Kiểm tra xem có địa chỉ nào đã là primary cho người dùng này chưa
    const primaryAddress = await Address.findOne({ user: this.user, status: "primary" });

    // Nếu đã có địa chỉ primary thì đặt trạng thái của địa chỉ mới là "secondary"
    if (primaryAddress) {
        this.status = "secondary";
    }

    next();
});

const Address = mongoose.model("Address", addressSchema);

export default Address;
