import mongoose from "mongoose";
const cartItem = new Schema({
    product : {type: Schema.Types.ObjectId , ref:"Product" , required: true},
    quantity : {type : Number , required:true , min:1}
})
const cartSchema = new Schema({
    userId:{type : Schema.Types.ObjectId , ref :"User"},
    products : [cartItem],
    totalprice : {type : Number , default : 0}
})
export default model("shopping-cart" , cartSchema)