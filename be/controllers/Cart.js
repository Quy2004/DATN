import Cart from "../models/Cart"
import { message } from 'antd';

export const addtoCart = async(req,res)=>{
    const {product, quantity , userId} = req.boby
    try{
        //kiểm tra người dùng có giỏ hàng hay chưa
        let cart = await Cart.findOne({user:userId});
       
    }catch(error){
        return res.status(400).send(error.message)
    }
}