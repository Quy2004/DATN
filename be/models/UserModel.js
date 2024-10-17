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
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = mongoose.models.users || mongoose.model("users", UserSchema);
export default User;
