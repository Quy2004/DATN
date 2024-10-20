import mongoose from 'mongoose'; // Thêm dòng này

const Schema = mongoose.Schema;

const cartItem = new Schema({
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
   
});

const cartSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    products: [cartItem],
    totalprice: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
});

export default mongoose.model("carts", cartSchema);