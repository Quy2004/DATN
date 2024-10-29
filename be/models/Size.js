import mongoose from "mongoose";

const Schema = mongoose.Schema;

const SizeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    priceSize: {
      type: Number,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    status: {
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

const Size = mongoose.model("Size", SizeSchema);

export default Size;
