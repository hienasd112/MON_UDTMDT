// Middleware bắt lỗi 404 (Không tìm thấy route)
const notFound = (req, res, next) => {
  const error = new Error(`Không tìm thấy - ${req.originalUrl}`);
  res.status(404);
  next(error); // Chuyển lỗi sang errorHandler
};

// Middleware bắt tất cả các lỗi khác (lỗi 500, lỗi validation,...)
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Xử lý lỗi cụ thể của Mongoose (ví dụ: CastError - ID không đúng định dạng)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Không tìm thấy tài nguyên';
  }
  

  // Log lỗi chi tiết ra console backend (chỉ khi ở môi trường dev)
  if (process.env.NODE_ENV !== 'production') {
      console.error("--- LỖI ĐÃ BẮT ĐƯỢC ---");
      console.error("StatusCode:", statusCode);
      console.error("Message:", message);
      console.error("Stack:", err.stack);
      console.error("-----------------------");
  }

  // Gửi response lỗi về cho frontend
  res.status(statusCode).json({
    message: message,
    // Gửi stack trace chỉ khi ở chế độ dev
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export { notFound, errorHandler };