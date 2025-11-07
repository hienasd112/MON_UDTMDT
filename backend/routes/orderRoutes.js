import express from 'express';
const router = express.Router();
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  getOrders,
  updateOrderToDelivered,
  deleteOrder,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// --- GỘP ROUTE '/' ---
router.route('/')
  .post(protect, addOrderItems) // User tạo đơn hàng
  .get(protect, admin, getOrders); // Admin lấy tất cả đơn hàng

// --- Route riêng của User ---
router.route('/myorders')
  .get(protect, getMyOrders); // User lấy đơn hàng của mình

// --- GỘP ROUTE '/:id' ---
// (Các route liên quan đến 1 ID đơn hàng cụ thể)
router.route('/:id')
  .get(protect, getOrderById) // User/Admin lấy chi tiết
  .delete(protect, admin, deleteOrder); // Admin xóa đơn hàng

// --- Route thanh toán & giao hàng ---
router.route('/:id/pay')
  .put(protect, updateOrderToPaid); // User/Cổng thanh toán cập nhật "Đã trả tiền"

router.route('/:id/deliver')
  .put(protect, admin, updateOrderToDelivered); // Admin cập nhật "Đã giao hàng"

export default router;