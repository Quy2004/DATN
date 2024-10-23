import express from "express";
import {
  createOrderDetail,
  getOrderDetails,
  getOrderDetailById,
  updateOrderDetail,

} from "../controllers/OrderDetail";

const router = express.Router();

// Tạo chi tiết đơn hàng mới
router.post("/", createOrderDetail);

// Lấy danh sách tất cả chi tiết đơn hàng
// router.get("/", getOrderDetails);

// Lấy chi tiết đơn hàng theo orderId và productId
// router.get("/:orderId/:productId", getOrderDetailById);

// Cập nhật chi tiết đơn hàng (sửa topping, size, quantity, ...)
// router.put("/:orderDetailId", updateOrderDetail);



export default router;