import mongoose from "mongoose";
const Schema = mongoose.Schema;
const ProductSchema = new Schema({
  name: {
    type: String,
    require: true,
  },
  price: {
    type: Number,
    require: true,
  },
  image: {
    type: [Object],
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  id_comment: {
    type: String,
    require: true,
  },
});

const Product = mongoose.model("Product", ProductSchema);
export default Product;
