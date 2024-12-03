import express from "express";
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  getAllOrders,
  cancelOrder,
  getOrderById,
  getOrderStats,
  getOrderStatusDistribution,
  getTopProducts,
  getCustomerStats,
  getRevenueByTimePeriod,
} from "../controllers/ordersController";

const router = express.Router();
// router.get("/statistics", getOrderStatistics);

// Endpoint để lấy tổng doanh thu và số lượng đơn hàng
router.get("/order-stats", getOrderStats);

// Endpoint để lấy phân phối trạng thái đơn hàng
router.get("/order-status-distribution", getOrderStatusDistribution);

// Endpoint để lấy các sản phẩm bán chạy nhất
router.get("/top-products", getTopProducts);

// Endpoint để lấy thống kê khách hàng
router.get("/customer-stats", getCustomerStats);

// Endpoint để lấy doanh thu theo thời gian (ngày, tuần, tháng)
router.get("/revenue-by-time", getRevenueByTimePeriod);
// Tạo đơn hàng
router.post("/", createOrder);

router.get("/", getAllOrders);
// Lấy danh sách đơn hàng của người dùng
router.get("/:userId", getOrders);
// Lấy đơn hàng bằng id
router.get("/order/:orderId", getOrderById);
// Cập nhật trạng thái đơn hàng
router.put("/status/:orderId", updateOrderStatus);
router.put("/cancel/:orderId", cancelOrder);

export default router;
