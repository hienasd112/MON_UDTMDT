import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

// @desc   Tạo đơn hàng mới 
// @route  POST /api/orders
// @access Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice,
    shippingPrice, discountPrice, couponCode, totalPrice,
  } = req.body;

  // 1. KIỂM TRA ĐẦU VÀO CƠ BẢN
  if (!orderItems || orderItems.length === 0) {
    res.status(400); throw new Error('Không có sản phẩm nào trong đơn hàng');
  }
  if (!shippingAddress || !shippingAddress.address || !shippingAddress.fullName || !shippingAddress.phone) {
    res.status(400); throw new Error('Vui lòng cung cấp đầy đủ thông tin giao hàng');
  }
  if (!paymentMethod) {
    res.status(400); throw new Error('Vui lòng chọn phương thức thanh toán');
  }

  // 2. KIỂM TRA TỒN KHO 
  const itemsFromDB = await Product.find({
    _id: { $in: orderItems.map(item => item.product) }
  });

  for (const item of orderItems) {
    const productFromDB = itemsFromDB.find(p => p._id.toString() === item.product);
    if (!productFromDB) {
      res.status(404); throw new Error(`Không tìm thấy sản phẩm: ${item.name}`);
    }
    if (productFromDB.stock < item.qty) {
      res.status(400);
      throw new Error(`Sản phẩm "${item.name}" không đủ hàng. (Chỉ còn ${productFromDB.stock} sản phẩm)`);
    }
  }

  // 3. TẠO ĐƠN HÀNG
  try {
    const order = new Order({
      user: req.user._id,
      orderItems: orderItems.map((x) => ({ ...x, product: x.product, _id: undefined })),
      shippingAddress, paymentMethod, itemsPrice,
      taxPrice: taxPrice || 0,
      shippingPrice: shippingPrice || 0,
      discountPrice: discountPrice || 0,
      couponCode: couponCode || null,
      totalPrice: totalPrice,
    });

    // 4. LƯU ĐƠN HÀNG
    const createdOrder = await order.save();

    // 5. TRỪ TỒN KHO
    const bulkOps = orderItems.map(item => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { stock: -item.qty } } // Dùng $inc để TRỪ
      }
    }));
    await Product.bulkWrite(bulkOps);

    console.log(`✅ Đơn hàng ${createdOrder._id} đã tạo VÀ ĐÃ TRỪ KHO.`);
    res.status(201).json(createdOrder);

  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi tạo đơn hàng", error: error.message });
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
// @access Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'fullName email');
  
  if (order) {
    if (order.user._id.toString() === req.user._id.toString() || req.user.role === 'admin') {
      res.status(200).json(order);
    } else {
      res.status(403); throw new Error('Không có quyền truy cập đơn hàng này');
    }
  } else {
    res.status(404); throw new Error('Không tìm thấy đơn hàng');
  }
});

// @desc   Cập nhật đơn hàng thành đã thanh toán
// @route  PUT /api/orders/:id/pay
// @access Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.isPaid = true; 
    order.paidAt = Date.now();
    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } else {
    res.status(404); throw new Error('Không tìm thấy đơn hàng');
  }
});

// @desc    Lấy tất cả đơn hàng (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  // --- (SỬA DÙNG 'fullName') ---
  const orders = await Order.find({})
                           .populate('user', 'id fullName email')
                           .sort({ createdAt: -1 });
  res.status(200).json(orders);
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
    res.status(200).json(updatedOrder);
  } else {
    res.status(404); throw new Error('Không tìm thấy đơn hàng');
  }
});

// @desc    Xóa đơn hàng (Admin) VÀ HOÀN KHO
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // --- LOGIC HOÀN KHO  ---
    try {
      const bulkOps = order.orderItems.map(item => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { stock: item.qty } } // Dùng $inc để CỘNG LẠI
        }
      }));
      
      if (bulkOps.length > 0) {
          await Product.bulkWrite(bulkOps);
      }
      console.log(`✅ Đã hoàn kho cho đơn hàng ${req.params.id}.`);
      
    } catch (stockError) {
      console.error(`❌ Lỗi khi hoàn kho cho đơn hàng ${req.params.id}:`, stockError);
    }
    // --- KẾT THÚC HOÀN KHO ---

    // 3. Xóa đơn hàng
    await Order.deleteOne({ _id: order._id });
    
    console.log(`✅ Đơn hàng ${req.params.id} đã xóa.`);
    res.status(200).json({ message: 'Đơn hàng đã được xóa (và đã hoàn kho nếu có thể)' });

  } else {
    res.status(404);
    throw new Error('Không tìm thấy đơn hàng');
  }
});

// @desc   Lấy thông tin thống kê cho Dashboard (có lọc theo ngày)
// @route  GET /api/orders/stats
// @access Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = {};
    if (startDate && endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter = { createdAt: { $gte: new Date(startDate), $lte: endOfDay } };
    }
    
    const paidDateFilter = { isPaid: true, ...dateFilter };

    const kpiStatsPromise = Order.aggregate([
      { $match: paidDateFilter },
      { $group: { _id: null, totalOrders: { $sum: 1 }, totalRevenue: { $sum: '$totalPrice' } } }
    ]);

    const chartDataPromise = Order.aggregate([
      { $match: paidDateFilter },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, dailyRevenue: { $sum: '$totalPrice' } } },
      { $sort: { _id: 1 } }
    ]);

    const topProductsPromise = Order.aggregate([
      { $match: paidDateFilter },
      { $unwind: '$orderItems' },
      { $group: { _id: '$orderItems.product', name: { $first: '$orderItems.name' }, totalQuantitySold: { $sum: '$orderItems.qty' } } },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: 5 }
    ]);

    const recentOrdersPromise = Order.find(dateFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'fullName'); 

    // --- Đếm tổng người dùng và sản phẩm ---
    const totalUsersPromise = User.countDocuments({ role: 'customer' }); 
    const totalProductsPromise = Product.countDocuments();

    const [ kpiStats, chartData, topProducts, recentOrders, totalUsers, totalProducts ] = await Promise.all([
      kpiStatsPromise, chartDataPromise, topProductsPromise, recentOrdersPromise, totalUsersPromise, totalProductsPromise
    ]);

    const stats = {
      kpi: {
        totalOrders: kpiStats.length > 0 ? kpiStats[0].totalOrders : 0,
        totalRevenue: kpiStats.length > 0 ? kpiStats[0].totalRevenue : 0,
        totalUsers: totalUsers,
        totalProducts: totalProducts
      },
      chartData: chartData,
      topProducts: topProducts,
      recentOrders: recentOrders
    };

    res.status(200).json(stats);
    
  } catch (error) {
    res.status(500);
    throw new Error('Không thể lấy dữ liệu thống kê: ' + error.message);
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
  getDashboardStats
};
