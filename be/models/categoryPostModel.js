import mongoose from "mongoose";

const Schema = mongoose.Schema;

const CategorySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
        type: String,
    },
    thumbnail: {
        type: [String],
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

const CategoryPost = mongoose.model("Category_post", CategorySchema);

export default CategoryPost;
