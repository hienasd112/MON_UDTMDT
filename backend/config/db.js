import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Đảm bảo đã gọi ở server.js

const connectDB = async () => {
  try {
    // Dùng MONGO_URI từ file .env
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "watch_shop", 
    });
    console.log(`✅ MongoDB đã kết nối: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Lỗi kết nối MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;