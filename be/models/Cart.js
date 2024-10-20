import mongoose from 'mongoose'; // Thêm dòng này

const Schema = mongoose.Schema;

const cartItem = new Schema({
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 }
});

const cartSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    products: [cartItem],
   
});

export default mongoose.model("carts", cartSchema);