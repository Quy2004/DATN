import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ToppingSchema = new Schema(
  {
    nameTopping: {
      type: String,
      required: [true, "Tên topping là bắt buộc"],
      trim: true,
      maxlength: [50, "Tên topping không được vượt quá 50 ký tự"],
    },
    category_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],
    priceTopping: {
      type: Number,
      required: [true, "Giá của topping là bắt buộc"],
      min: [0, "Giá phải là một số dương"],
    },
    statusTopping: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
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

const Topping = mongoose.model("Topping", ToppingSchema);
export default Topping;
