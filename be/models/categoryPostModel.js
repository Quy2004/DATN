import mongoose from "mongoose";

const Schema = mongoose.Schema;

const CategoryPostSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
        type: String,
    },
    thumbnail: {
        type: String,
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

const CategoryPost = mongoose.model("CategoryPost", CategoryPostSchema);

export default CategoryPost;
