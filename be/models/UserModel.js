import mongoose from "mongoose";
const Schema = mongoose.Schema;
const UserSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    phone: {
      type: Number,
      require: true,
      unique: true,
    },
    avata: {
      type: [Object],
      require: true,
    },
    userName:{
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    address: {
        type: String,
        require: true,
    },
    status:{
        type: String,
        enum: ["active", "inactive"],
        default: "active",

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

const User = mongoose.model("users", UserSchema);
export default User;
