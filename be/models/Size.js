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
    isDeleted: {
        type: Boolean,
        default: false,
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


const Size = mongoose.model("Size", SizeSchema);

export default Size;
