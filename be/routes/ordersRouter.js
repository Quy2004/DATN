import express from "express";
import {
    createOrder,
    getOrders,
    updateOrderStatus,
    getAllOrders, 
    cancelOrder,
    getOrderById
  } from "../controllers/ordersController";

const router = express.Router();
// Tạo đơn hàng
router.post('/', createOrder);

router.get('/', getAllOrders);
// Lấy danh sách đơn hàng của người dùng
router.get('/:userId', getOrders);
// Lấy đơn hàng bằng id
router.get('/order/:orderId', getOrderById)
// Cập nhật trạng thái đơn hàng
router.put('/status/:orderId', updateOrderStatus);
router.put('/cancel/:orderId', cancelOrder);

export default router;