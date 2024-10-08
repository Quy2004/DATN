import mongoose from "mongoose";
const Schema = mongoose.Schema;
const ProductSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
    category_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    price: {
      type: Number,
      require: true,
    },
    discount: {
      type: Number,
      default: 0, // Nếu sản phẩm không giảm giá, giá trị mặc định là 0
    }, 
    // ảnh chính
    image: {
      type: String,
      require: true,
    },
    // ảnh phụ
    gallery: {
      type: Array,
    },

    description: {
      type: String,
    },
    id_comment: {
      type: String,
      require: true,
    },
    size_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Size", // Tham chiếu đến bảng `Size`
      },
    ],
    topping_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topping", // Tham chiếu đến bảng `Topping`
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Product = mongoose.model("Product", ProductSchema);
export default Product;
