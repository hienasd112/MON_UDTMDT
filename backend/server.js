import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import connectDB from "./config/db.js";
import cookieParser from 'cookie-parser';
import paymentRoutes from "./routes/paymentRoutes.js";


// --- IMPORT CÁC ROUTE ---
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";

// --- IMPORT ERROR MIDDLEWARE ---
import { notFound, errorHandler } from './middleware/errorMiddleware.js'; 

// Cấu hình
dotenv.config();
connectDB();
const app = express();

// Middlewares
app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser()); 

// --- API ROUTES ---
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes); 
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/payment", paymentRoutes);

// --- Xử lý Uploads (Static) ---
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));


// --- ERROR HANDLING MIDDLEWARES ---
app.use(notFound); // 
app.use(errorHandler); 

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server đang chạy tại port ${PORT}`));