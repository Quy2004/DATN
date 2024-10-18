import Cart from "../models/Cart"
import { message } from 'antd';

export const addtoCart = async(req,res)=>{
    const {product, quantity , userId} = req.boby
    try{
        //kiểm tra người dùng có giỏ hàng hay chưa
        let cart = await Cart.findOne({user:userId});
        if(cart){
            //kiểm tra sản phẩm đó có sản phẩm trong giỏ hàng hay không
            const productIndex = cart.products.findIndex(
                (produc) => produc.product.toString() == product
            );
            console.log(productIndex)
            if(productIndex > -1){
                //nếu có thì cộng thêm số lượng sản phẩm
                cart.products[productIndex].quantity +=quantity;
            }else{
                //nếu không có thì push thêm sản phẩm vào mảng products
                cart.products.push({product,quantity})
            }
        }
    }catch(error){
        return res.status(400).send(error.message)
    }
}