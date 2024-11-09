import mongoose from 'mongoose'; // Thêm dòng này

const Schema = mongoose.Schema;

const cartItem = new Schema({
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    product_toppings: [
      {
        topping_id: { type: mongoose.Schema.Types.ObjectId, ref: "Topping" },
      },
    ],
    product_sizes: [
      {
        size_id: { type: mongoose.Schema.Types.ObjectId, ref: "Size" }
      },
    ],
});

const cartSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    products: [cartItem],
    totalprice: { type: Number, default: 0 },
    
    
},

{
  timestamps: true,
  versionKey: false,
}
);

export default mongoose.model("carts", cartSchema);