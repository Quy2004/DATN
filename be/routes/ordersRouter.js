import express from "express";
import {
    createOrder,
    getOrders
  } from "../controllers/ordersController";

const router = express.Router();
// Tạo đơn hàng
router.post('/', createOrder);

// Lấy danh sách đơn hàng của người dùng
router.get('/:userId', getOrders);

export default router;