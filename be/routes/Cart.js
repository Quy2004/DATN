import { addtoCart } from "../controllers/Cart";
import express from "express";
const RouterCart = express.Router();
RouterCart.post('/addcart',addtoCart)
export default RouterCart