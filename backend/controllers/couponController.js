import Coupon from '../models/couponModel.js';
import asyncHandler from 'express-async-handler';

// @desc   Kiểm tra (validate) mã giảm giá (Cho khách hàng)
// @route  POST /api/coupons/validate
// @access Public/Private
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body;

  if (!code) {
    res.status(400);
    throw new Error('Vui lòng nhập mã giảm giá');
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    res.status(404);
    throw new Error('Mã giảm giá không tồn tại');
  }

  // Kiểm tra 1: Hết hạn
  if (coupon.expiryDate < new Date()) {
    res.status(400);
    throw new Error('Mã giảm giá đã hết hạn');
  }

  // Kiểm tra 2: Đơn hàng tối thiểu
  if (coupon.minPurchase > 0 && cartTotal < coupon.minPurchase) {
    res.status(400);
    throw new Error(`Mã này chỉ áp dụng cho đơn hàng từ ${coupon.minPurchase.toLocaleString('vi-VN')} ₫`);
  }

  // Tính toán số tiền được giảm
  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (cartTotal * coupon.discountValue) / 100;
  } else if (coupon.discountType === 'fixed') {
    discountAmount = coupon.discountValue;
  }

  // Đảm bảo tiền giảm không vượt quá tổng tiền hàng
  if (discountAmount > cartTotal) {
    discountAmount = cartTotal;
  }

  // Trả về thông tin hợp lệ
  res.status(200).json({
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount: Math.round(discountAmount), 
  });
});


// --- HÀM MỚI (Cho Admin) ---

// @desc   Lấy tất cả mã giảm giá (Admin)
// @route  GET /api/coupons
// @access Private/Admin
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.status(200).json(coupons);
});

// @desc   Tạo mã giảm giá mới (Admin)
// @route  POST /api/coupons
// @access Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountType, discountValue, expiryDate, minPurchase } = req.body;

  if (!code || !discountType || !discountValue || !expiryDate) {
    res.status(400);
    throw new Error('Vui lòng điền các trường bắt buộc: code, loại, giá trị, ngày hết hạn');
  }

  const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
  if (couponExists) {
    res.status(400);
    throw new Error('Mã (code) này đã tồn tại');
  }

  const coupon = new Coupon({
    code: code.toUpperCase(),
    discountType,
    discountValue,
    expiryDate,
    minPurchase: minPurchase || 0,
  });

  const createdCoupon = await coupon.save();
  res.status(201).json(createdCoupon);
});

// @desc   Xóa mã giảm giá (Admin)
// @route  DELETE /api/coupons/:id
// @access Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    await Coupon.deleteOne({ _id: coupon._id });
    res.status(200).json({ message: 'Mã giảm giá đã được xóa' });
  } else {
    res.status(404);
    throw new Error('Không tìm thấy mã giảm giá');
  }
});

export {
  validateCoupon,
  getCoupons,
  createCoupon,
  deleteCoupon,
};