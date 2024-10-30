import mongoose from "mongoose";
import slugify from "slugify"; // Import thư viện slugify

const { Schema } = mongoose;

const PostSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    categoryPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CategoryPost",
      required: true,
    },
    excerpt: {
      type: String,
    },
    imagePost: {
      type: String,
      required: true,
    },
    galleryPost: {
      type: [String],
      default: [],
    },
    content: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Middleware để tạo slug trước khi lưu vào cơ sở dữ liệu
PostSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

const Post = mongoose.model("Post", PostSchema);

export default Post;
