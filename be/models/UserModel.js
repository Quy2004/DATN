import mongoose from "mongoose";

const Schema = mongoose.Schema;
const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    avatars: {
      type: [Object],
      default: "be/image/avt.jpg"
    },
    userName:{
        type: String,
        required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isDeleted:{
        type: Boolean,
        default: false,

    },
    role: {
        type: String,
        enum: ["user", "manager", "admin"],
        default: "user",
    },
    // Thêm trường resetToken và resetTokenExpires cho chức năng quên mật khẩu
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpires: {
      type: Date,
      default: null,
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Hook trước khi lưu một user
UserSchema.pre('save', async function (next) {
  const userCount = await this.constructor.countDocuments();

  // Nếu chưa có user nào, gán role là 'admin'
  if (userCount === 0) {
      this.role = 'admin';
  }
   // Kiểm tra nếu mật khẩu đã được mã hóa
   if (!this.isModified("password")) {
    return next();
  }

  // Mã hóa mật khẩu
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);

  next();
});

const User = mongoose.models.users || mongoose.model("users", UserSchema);
export default User;
