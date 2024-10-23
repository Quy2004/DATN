import mongoose from "mongoose";
import slugify from "slugify";
import mongoosePaginate from "mongoose-paginate-v2";

const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Tên sản phẩm không được bỏ trống"],
      trim: true,
    },
    category_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    sale_price: {
      type: Number,
      required: true,
    },

    discount: {
      type: Number,
      default: 0,
      min: [0, "Giảm giá phải là số dương"],
    },
    image: {
      type: String,
      required: [true, "Hình ảnh chính là bắt buộc"],
    },
    thumbnail: {
      type: [String],
    },
    description: {
      type: String,
      trim: true,
    },

    product_sizes: [
      {
        size_id: { type: mongoose.Schema.Types.ObjectId, ref: "Size" },
        status: {
          type: String,
          enum: ["available", "unavailable"],
          default: "available",
        },
      },
    ],

    product_toppings: [
      {
        topping_id: { type: mongoose.Schema.Types.ObjectId, ref: "Topping" },
      },
    ],
    status: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
    },
    slug: {
      type: String,
      unique: true,
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

// Sử dụng slugify để tạo slug từ tên sản phẩm
ProductSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Thêm plugin paginate
ProductSchema.plugin(mongoosePaginate);

const Product = mongoose.model("Product", ProductSchema);

export default Product;
