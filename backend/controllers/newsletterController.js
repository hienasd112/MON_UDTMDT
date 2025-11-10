import asyncHandler from 'express-async-handler';
import Subscriber from '../models/subscriberModel.js';

// @desc   Đăng ký nhận tin
// @route  POST /api/newsletter/subscribe
// @access Public
const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Vui lòng cung cấp email');
  }

  const emailExists = await Subscriber.findOne({ email });

  if (emailExists) {
    res.status(400);
    throw new Error('Email này đã được đăng ký nhận tin từ trước.');
  }

  const subscriber = await Subscriber.create({
    email,
  });

  if (subscriber) {
    res.status(201).json({
      message: 'Đăng ký nhận tin thành công!'
    });
  } else {
    res.status(400);
    throw new Error('Dữ liệu không hợp lệ');
  }
});

// --- (THÊM HÀM MỚI) ---
// @desc   Lấy tất cả email đăng ký (cho Admin)
// @route  GET /api/newsletter
// @access Private/Admin
const getAllSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await Subscriber.find({}).sort({ subscribedAt: -1 });
  res.status(200).json(subscribers);
});

export { subscribe, getAllSubscribers };