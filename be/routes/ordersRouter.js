import express from "express";
import {
    createOrder,
    getOrders,
    updateOrderStatus,
    getAllOrders 
  } from "../controllers/ordersController";

const router = express.Router();
// Tạo đơn hàng
router.post('/', createOrder);

router.get('/orders', getAllOrders);
// Lấy danh sách đơn hàng của người dùng
router.get('/:userId', getOrders);

// Cập nhật trạng thái đơn hàng
router.put('/status/:orderId', updateOrderStatus);

export default router;