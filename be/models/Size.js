import mongoose from "mongoose";

const Schema = mongoose.Schema;

const SizeSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
    priceSize: {
      type: Number,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Size = mongoose.model("Size", SizeSchema);

export default Size;
