import express from "express";
const router = express.Router();
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js"; // Import middleware

// GET /api/products (Public)
// POST /api/products (Admin Only)
router.route("/")
  .get(getProducts)
  .post(protect, admin, createProduct); // Bảo vệ route POST

// GET /api/products/:id (Public)
// PUT /api/products/:id (Admin Only)
// DELETE /api/products/:id (Admin Only)
router.route("/:id")
  .get(getProductById)
  .put(protect, admin, updateProduct)   // Bảo vệ route PUT
  .delete(protect, admin, deleteProduct); // Bảo vệ route DELETE

export default router;