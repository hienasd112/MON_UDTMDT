import express from 'express';
const router = express.Router();
import {
  createVnpayPaymentUrl,
  vnpayReturn,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

// @route  POST /api/payment/create-vnpay-url
// User đăng nhập mới được tạo link
router.post('/create-vnpay-url', protect, createVnpayPaymentUrl);

// @route  GET /api/payment/vnpay-return
// VNPAY gọi về, không cần protect
router.get('/vnpay-return', vnpayReturn);

export default router;