import path from 'path';
import express from 'express';
import multer from 'multer';
import asyncHandler from 'express-async-handler';
import { protect, admin } from '../middleware/authMiddleware.js'; // Bảo vệ route (chỉ admin được upload)

const router = express.Router();

// --- Cấu hình Multer ---
const storage = multer.diskStorage({
  // Nơi lưu file
  destination(req, file, cb) {
    // Lưu vào thư mục 'uploads/' trong thư mục gốc backend
    // Đảm bảo thư mục 'backend/uploads/' đã tồn tại!
    cb(null, 'uploads/'); 
  },
  // Đặt tên file (để tránh trùng lặp)
  filename(req, file, cb) {
    // Tên file mới: fieldname-timestamp.extension
    // Ví dụ: image-1678886400000.jpg
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Hàm kiểm tra loại file (chỉ chấp nhận ảnh)
function checkFileType(file, cb) {
  // Các kiểu file ảnh hợp lệ
  const filetypes = /jpg|jpeg|png|gif|webp/;
  // Kiểm tra đuôi file (extension)
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Kiểm tra kiểu MIME
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true); // Hợp lệ
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif, webp)!'), false); // Từ chối
  }
}

// Khởi tạo middleware upload của Multer
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB (tùy chọn)
});

// --- Định nghĩa Route Upload ---
// POST /api/upload
// Middleware: protect, admin -> Chỉ admin đăng nhập mới được upload
// Middleware: upload.single('image') -> Xử lý upload 1 file có tên field là 'image'
router.post('/', protect, admin, upload.single('image'), asyncHandler(async (req, res) => {
  // Kiểm tra xem file đã được upload chưa (multer thêm 'req.file')
  if (!req.file) {
    res.status(400);
    throw new Error('Không có file nào được chọn hoặc file không hợp lệ');
  }

  // Nếu upload thành công, req.file sẽ chứa thông tin file
  // Trả về đường dẫn của file đã upload để frontend lưu lại
  // Quan trọng: Đường dẫn phải bắt đầu bằng '/' và dùng '/'
  const imagePath = `/${req.file.path.replace(/\\/g, '/')}`; 
  
  console.log("✅ Ảnh đã upload thành công:", imagePath);
  res.status(200).json({
    message: 'Upload ảnh thành công',
    image: imagePath, // Trả về đường dẫn dạng /uploads/image-timestamp.jpg
  });

}), (err, req, res, next) => { // Middleware xử lý lỗi riêng cho Multer
    console.error("❌ Lỗi Multer Upload:", err.message);
    // Trả về lỗi rõ ràng hơn cho frontend
    if (err instanceof multer.MulterError) {
        // Lỗi từ Multer (vd: file quá lớn)
        res.status(400).json({ message: `Lỗi Multer: ${err.message}` });
    } else if (err) {
        // Lỗi từ checkFileType hoặc lỗi khác
        res.status(400).json({ message: err.message || "Lỗi không xác định khi upload." });
    } else {
        next(); // Chuyển sang error handler chung nếu không phải lỗi upload
    }
});


export default router;