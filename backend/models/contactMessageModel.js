import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    trim: true,
  },
  subject: {
    type: String,
    required: [true, 'Vui lòng nhập chủ đề'],
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'Vui lòng nhập nội dung tin nhắn'],
  },
  isRead: { // Dùng cho Admin sau này
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

export default ContactMessage;