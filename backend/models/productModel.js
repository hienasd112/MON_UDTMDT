import mongoose from "mongoose";

// Schema con cho Đánh giá (lồng)
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  stock: { type: Number, required: true, default: 0 },
  images: [{ type: String }],
  category: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Category" },

  // --- Thông số kỹ thuật đặc thù  ---
  movement: { type: String, required: true }, // Bộ máy
  caseMaterial: { type: String, required: true }, // Chất liệu vỏ
  strapMaterial: { type: String, required: true }, // Chất liệu dây
  waterResistance: { type: String }, // Chống nước
  caseSize: { type: Number }, // Kích thước mặt
  glassType: { type: String }, // Mặt kính

  // --- Đánh giá ---
  reviews: [reviewSchema],
  avgRating: { type: Number, required: true, default: 0 },
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
export default Product;