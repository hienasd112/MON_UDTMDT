import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
  // 1. Tạo token
  const token = jwt.sign(
    { userId }, // Nội dung token
    process.env.JWT_SECRET, // Lấy khóa bí mật từ file .env
    { expiresIn: "30d" } // Hết hạn 30 ngày
  );

  // 2. Gửi token qua Cookie (An toàn hơn localStorage)
  res.cookie("jwt", token, {
    httpOnly: true, // Chỉ server được đọc
    secure: process.env.NODE_ENV !== "development", // Chỉ gửi qua HTTPS (khi deploy)
    sameSite: "strict", // Chống tấn công CSRF
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày (tính bằng mili giây)
  });
};

export default generateToken;