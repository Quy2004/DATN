import { addtoCart, getCart } from "../controllers/Cart";
import express from "express";
const RouterCart = express.Router();
RouterCart.post('/',addtoCart)

export default RouterCart