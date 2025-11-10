import asyncHandler from 'express-async-handler';
import ContactMessage from '../models/contactMessageModel.js';

// @desc   Gửi tin nhắn liên hệ
// @route  POST /api/contact
// @access Public
const submitMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    res.status(400);
    throw new Error('Vui lòng điền đầy đủ thông tin.');
  }

  const contactMessage = await ContactMessage.create({
    name,
    email,
    subject,
    message,
  });

  if (contactMessage) {
    res.status(201).json({
      message: 'Gửi tin nhắn thành công! Chúng tôi sẽ phản hồi sớm nhất.',
    });
  } else {
    res.status(400);
    throw new Error('Dữ liệu không hợp lệ');
  }
});

// --- (THÊM HÀM MỚI) ---
// @desc   Lấy tất cả tin nhắn liên hệ (cho Admin)
// @route  GET /api/contact
// @access Private/Admin
const getAllMessages = asyncHandler(async (req, res) => {
  // Sắp xếp tin nhắn mới nhất lên đầu
  const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
  res.status(200).json(messages);
});

export { submitMessage, getAllMessages };