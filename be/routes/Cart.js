import { addtoCart, deleteCartItem, getCart } from "../controllers/Cart";
import express from "express";
const RouterCart = express.Router();
RouterCart.post('/',addtoCart)
RouterCart.get('/:userId', getCart); 
RouterCart.patch('/:cartId/product/:productId', deleteCartItem); 
export default RouterCart