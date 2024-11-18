import mongoose from "mongoose";

const Schema = mongoose.Schema;

const CommentSchema = new Schema(
  {
    content: {
      type: String,
      required: true, // Bắt buộc phải có nội dung
    },
    image: {
      type: [String],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    //   index: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    //   index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null, // Hỗ trợ bình luận cha/con
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);



const Comment = mongoose.model("Comment", CommentSchema);

export default Comment;