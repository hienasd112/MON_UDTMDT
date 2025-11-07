import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true, // Tự động chuyển 'sale10' thành 'SALE10'
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'], // 'percentage' (10%) hoặc 'fixed' (100k)
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    minPurchase: { // (Tùy chọn) Số tiền tối thiểu để áp dụng
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;