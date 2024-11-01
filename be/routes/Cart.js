import { addtoCart, getCart } from "../controllers/Cart";
import express from "express";
const RouterCart = express.Router();
RouterCart.post('/',addtoCart)
RouterCart.get('/:userId', getCart); 
export default RouterCart