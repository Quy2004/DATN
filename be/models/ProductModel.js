import mongoose from "mongoose";
import slugify from "slugify";
import mongoosePaginate from "mongoose-paginate-v2";

const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Tên sản phẩm là bắt buộc"],
      trim: true,
    },
    category_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],
    discount: {
      type: Number,
      default: 0,
      min: [0, "Giảm giá phải là một số dương"],
    },
    image: {
      type: String,
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
        price: { type: Number, required: true },
        stock: { type: Number, required: true },
      },
    ],

    product_toppings: [
      {
        topping_id: { type: mongoose.Schema.Types.ObjectId, ref: "Topping" },
        stock: { type: Number, required: true },
      },
    ],
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
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

ProductSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

ProductSchema.plugin(mongoosePaginate);

const Product = mongoose.model("Product", ProductSchema);

export default Product;
