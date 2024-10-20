import mongoose from 'mongoose'; // Thêm dòng này

const Schema = mongoose.Schema;



export default mongoose.model("carts", cartSchema);