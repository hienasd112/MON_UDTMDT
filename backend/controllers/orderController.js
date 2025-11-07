import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import asyncHandler from 'express-async-handler';

// @desc   Tạo đơn hàng mới
// @route  POST /api/orders
// @access Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress, // Đối tượng { fullName, phone, address }
    paymentMethod,
    itemsPrice,      // Tổng tiền hàng (trước giảm giá)
    taxPrice,        // Tiền thuế (nếu có)
    shippingPrice,   // Phí vận chuyển
    discountPrice,   // Số tiền được giảm giá (từ coupon)
    couponCode,      // Mã coupon đã áp dụng (nếu có)
    totalPrice,      // Tổng tiền cuối cùng (SAU KHI TRỪ giảm giá)
  } = req.body;

  // --- Kiểm tra dữ liệu đầu vào ---
  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('Không có sản phẩm nào trong đơn hàng');
  }
  if (!shippingAddress || !shippingAddress.address || !shippingAddress.fullName || !shippingAddress.phone) {
    res.status(400);
    throw new Error('Vui lòng cung cấp đầy đủ thông tin giao hàng');
  }
  if (!paymentMethod) {
    res.status(400);
    throw new Error('Vui lòng chọn phương thức thanh toán');
  }
  // (Kiểm tra các giá trị tiền tệ nếu cần)

  try {
    // --- Tạo đối tượng Order mới ---
    const order = new Order({
      user: req.user._id, // Lấy ID user từ middleware 'protect'
      orderItems: orderItems.map((x) => ({
        ...x,
        product: x.product,
        _id: undefined, // Ngăn Mongoose tự tạo _id cho sub-document
      })),
      shippingAddress: shippingAddress,
      paymentMethod: paymentMethod,
      itemsPrice: itemsPrice,
      taxPrice: taxPrice || 0,
      shippingPrice: shippingPrice || 0,
      discountPrice: discountPrice || 0, // Lưu tiền giảm giá
      couponCode: couponCode || null,   // Lưu mã coupon đã dùng
      totalPrice: totalPrice,          // Lưu tổng tiền cuối cùng
    });

    // --- Lưu vào database ---
    const createdOrder = await order.save();

    console.log("✅ Đơn hàng đã tạo thành công:", createdOrder._id);
    res.status(201).json(createdOrder); // Trả về đơn hàng vừa tạo

  } catch (error) {
    // --- Xử lý lỗi khi lưu ---
    console.error("❌ Lỗi nghiêm trọng khi gọi order.save():", error);
    if (error.name === 'ValidationError') { // Lỗi do dữ liệu không khớp model
      const messages = Object.values(error.errors).map(val => val.message);
      res.status(400).json({ message: "Dữ liệu đơn hàng không hợp lệ", errors: messages });
    } else { // Các lỗi khác (ví dụ: mất kết nối DB)
      res.status(500).json({ message: "Lỗi server khi tạo đơn hàng", error: error.message });
    }
  }
});

// @desc   Lấy đơn hàng của người dùng đang đăng nhập
// @route  GET /api/orders/myorders
// @access Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(orders);
});

// @desc   Lấy chi tiết đơn hàng theo ID
// @route  GET /api/orders/:id
// @access Private (User xem của mình, Admin xem của mọi người)
const getOrderById = asyncHandler(async (req, res) => {
  // Lấy thông tin đơn hàng và populate tên/email của user đặt hàng
  const order = await Order.findById(req.params.id).populate(
    'user',
    'fullName email'
  );

  if (order) {
     // Kiểm tra quyền truy cập: Hoặc là chủ đơn hàng, hoặc là Admin
     if (order.user._id.toString() === req.user._id.toString() || req.user.role === 'admin') {
         res.status(200).json(order);
     } else {
         res.status(403); // Forbidden - Không có quyền
         throw new Error('Không có quyền truy cập đơn hàng này');
     }
  } else {
    res.status(404); // Not Found - Không tìm thấy đơn hàng
    throw new Error('Không tìm thấy đơn hàng');
  }
});

// @desc   Cập nhật đơn hàng thành đã thanh toán (ví dụ: sau khi cổng TT báo về)
// @route  PUT /api/orders/:id/pay
// @access Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    // Lưu thông tin từ cổng thanh toán (nếu có)
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer?.email_address,
    };

    const updatedOrder = await order.save();
    console.log("✅ Đơn hàng đã cập nhật thành Đã thanh toán:", order._id);
    res.status(200).json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy đơn hàng');
  }
});


// --- PHẦN CHO ADMIN ---

// @desc    Lấy tất cả đơn hàng (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  console.log("--- DEBUG [3/3]: Đã vào controller 'getOrders' ---");

  try {
    console.log("--- DEBUG [3/3]: Bước 1: Chuẩn bị truy vấn database...");
    
     const orders = await Order.find({})
                              .populate('user', 'id fullName email') // Lấy thông tin user liên quan
                              .sort({ createdAt: -1 }); // Sắp xếp mới nhất lên đầu
                              
    console.log(`--- DEBUG [3/3]: Bước 2: Truy vấn thành công. Tìm thấy ${orders.length} đơn hàng.`);

    res.status(200).json(orders); // Trả về mảng đơn hàng
    console.log("--- DEBUG [3/3]: Bước 3: Gửi response thành công. ---");

  } catch (error) {
    console.error("--- DEBUG [3/3]: LỖI NGHIÊM TRỌNG TRONG getOrders ---:", error);
    res.status(500); // Lỗi server
    throw new Error('Lỗi server khi lấy danh sách đơn hàng');
  }
});

// @desc    Cập nhật đơn hàng thành đã giao (Admin)
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();
    console.log("✅ Đơn hàng đã cập nhật thành Đã giao:", order._id);
    res.status(200).json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy đơn hàng');
  }
});

// @desc    Xóa đơn hàng (Admin)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    await Order.deleteOne({ _id: order._id });
    console.log("✅ Đơn hàng đã xóa:", req.params.id);
    res.status(200).json({ message: 'Đơn hàng đã được xóa' });
  } else {
    res.status(404);
    throw new Error('Không tìm thấy đơn hàng');
  }
});

export {
  addOrderItems,          
  getMyOrders,          
  getOrderById,         
  updateOrderToPaid,    
  getOrders,            
  updateOrderToDelivered, 
  deleteOrder,          
};