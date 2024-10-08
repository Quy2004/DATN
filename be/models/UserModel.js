import mongoose from "mongoose";

const Schema = mongoose.Schema;
const UserSchema = new Schema(
  {
    email: {
      type: String,
      require: true,
      unique: true,
    },
    avatar: {
      type: String,
      default: "be/image/avt.jpg",
      
    },
    username:{
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    status:{
        type: String,
        enum: ["active", "inactive"],
        default: "active",

    },
    address_id:{
        type: mongoose.Schema.Types.ObjectId, ref:'address',

    },
    role: {
        type: String,
        enum: ["user", "admin", "manager"],
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
