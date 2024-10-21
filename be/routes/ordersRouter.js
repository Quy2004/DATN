import express from "express";
import {
    createOrder
   
  } from "../controllers/ordersController";

const router = express.Router();
// Tạo đơn hàng
router.post('/', createOrder);

export default router;