import express from 'express';
const router = express.Router();
import {
  validateCoupon,
  getCoupons,
  createCoupon,
  deleteCoupon,
} from '../controllers/couponController.js';
// Import middleware bảo vệ
import { protect, admin } from '../middleware/authMiddleware.js';

// --- Route cho Khách hàng ---
// POST /api/coupons/validate
router.route('/validate').post(validateCoupon); 

// --- Routes cho Admin (Bắt buộc phải là Admin) ---

// GET /api/coupons
// POST /api/coupons
router.route('/')
  .get(protect, admin, getCoupons)    // Lấy danh sách
  .post(protect, admin, createCoupon); // Tạo mới

// DELETE /api/coupons/:id
router.route('/:id')
  .delete(protect, admin, deleteCoupon); // Xóa

export default router;