import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

const protect = asyncHandler(async (req, res, next) => {
  console.log(`--- DEBUG [1/3]: Chạy middleware 'protect' cho route: ${req.originalUrl}`); // LOG 1
  let token;
  token = req.cookies.jwt; // Đọc cookie 'jwt'

  if (token) {
    try {
      console.log("--- DEBUG [1/3]: Đã tìm thấy token, đang xác thực..."); // LOG 2
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Tìm user trong DB bằng ID từ token
      req.user = await User.findById(decoded.userId).select('-password');
      
      if (!req.user) {
         console.error("--- DEBUG [1/3]: LỖI! Token hợp lệ nhưng không tìm thấy user (có thể user đã bị xóa)."); // LOG LỖI
         res.status(401);
         throw new Error('Token hợp lệ nhưng không tìm thấy người dùng');
      }

      console.log(`--- DEBUG [1/3]: Xác thực 'protect' thành công. User: ${req.user.email}`); // LOG 3
      next(); // Đi tiếp
    } catch (error) {
      console.error("--- DEBUG [1/3]: LỖI! Token không hợp lệ hoặc hết hạn ---", error.message); // LOG LỖI
      res.status(401);
      throw new Error('Token không hợp lệ, không có quyền truy cập');
    }
  } else {
    console.log("--- DEBUG [1/3]: LỖI! Không tìm thấy token (chưa đăng nhập)."); // LOG LỖI
    res.status(401);
    throw new Error('Chưa đăng nhập, không có quyền truy cập');
  }
});

const admin = (req, res, next) => {
  console.log("--- DEBUG [2/3]: Chạy middleware 'admin' ---"); // LOG 4
  
  // Kiểm tra (dùng toLowerCase để an toàn)
  if (req.user && req.user.role && req.user.role.toLowerCase() === 'admin') {
    console.log("--- DEBUG [2/3]: Xác nhận là Admin. Cho phép đi tiếp."); // LOG 5
    next(); // Là admin, đi tiếp
  } else {
    console.log(`--- DEBUG [2/3]: LỖI! User không phải Admin (Role: ${req.user?.role})`); // LOG LỖI
    res.status(403); // 403 Forbidden
    throw new Error('Không có quyền Admin');
  }
};

export { protect, admin };