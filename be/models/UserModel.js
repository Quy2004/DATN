import mongoose from "mongoose";
import bcryptjs from 'bcryptjs';

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
        enum: ["user", "admin"],
        default: "user",
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

  next();
});

const User = mongoose.model("User", UserSchema);

export default User;