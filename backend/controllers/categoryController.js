import Category from '../models/categoryModel.js';
import asyncHandler from 'express-async-handler';

// @desc   Lấy tất cả danh mục (Hãng)
// @route  GET /api/categories
// @access Public
const getCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    
    // --- ĐẢM BẢO CHỈ TRẢ VỀ MẢNG ---
    res.status(200).json(categories); 
    // KHÔNG trả về { categories: categories } hay gì khác
    
  } catch (error) {
     console.error("Lỗi khi lấy categories:", error);
     res.status(500).json([]); // Trả về mảng rỗng nếu lỗi
  }
});

// @desc   Tạo danh mục mới
// @route  POST /api/categories
// @access Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Tên danh mục là bắt buộc');
  }

  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    res.status(400);
    throw new Error('Danh mục này đã tồn tại');
  }

  const category = new Category({ name });

  try {
    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
     console.error("Lỗi khi tạo category:", error);
     res.status(500).json({ message: "Lỗi server khi tạo danh mục" });
  }
});

export {
  getCategories,
  createCategory,
};