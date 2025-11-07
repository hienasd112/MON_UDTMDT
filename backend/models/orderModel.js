import mongoose from 'mongoose';

// Schema cho từng sản phẩm trong giỏ hàng
const orderItemSchema = mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product',
  },
});

// Schema chính cho đơn hàng
const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: [true, 'Họ tên người nhận là bắt buộc'] },
      phone: { type: String, required: [true, 'Số điện thoại là bắt buộc'] },
      address: { type: String, required: [true, 'Địa chỉ là bắt buộc'] },
    },

    paymentMethod: {
      type: String,
      required: true,
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    discountPrice: { 
      type: Number, 
      required: true, 
      default: 0.0 },

    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    couponCode: { 
      type: String,
       default: null 
      },

    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;