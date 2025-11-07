import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import users from "./data/users.js";
import categories from "./data/categories.js";
import products from "./data/products.js";
import User from "./models/userModel.js";
import Category from "./models/categoryModel.js";
import Product from "./models/productModel.js";

dotenv.config();

await connectDB();

const importData = async () => {
  try {
    // ---- XÓA DỮ LIỆU CŨ ----
    await Product.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();

    console.log("...Đã xóa dữ liệu cũ");

    // ---- THÊM DỮ LIỆU MỚI ----
    // 1. Thêm Users
    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id; 
    console.log("...Đã thêm Users");

    // 2. Thêm Categories
    const createdCategories = await Category.insertMany(categories);
    console.log("...Đã thêm Categories");

    // 3. Map Categories vào Sản phẩm
    // Tạo một map để tra cứu ID nhanh
    const categoryMap = createdCategories.reduce((acc, category) => {
      acc[category.name] = category._id; // Map theo Tên (e.g., "Rolex" -> ObjectId(...))
      return acc;
    }, {});

    const sampleProducts = products.map((product) => {
      return {
        ...product,
        category: categoryMap[product.brand], // Gán ObjectId của category
      };
    });

    // 4. Thêm Products
    await Product.insertMany(sampleProducts);
    console.log("...Đã thêm Products");

    console.log("✅ Gieo mầm dữ liệu thành công!");
    process.exit();
  } catch (error) {
    console.error(`❌ Lỗi gieo mầm: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();

    console.log("🔥 Đã hủy dữ liệu thành công!");
    process.exit();
  } catch (error) {
    console.error(`❌ Lỗi hủy dữ liệu: ${error}`);
    process.exit(1);
  }
};

// Logic để chạy script từ dòng lệnh
// node backend/seeder.js -> Import
// node backend/seeder.js -d -> Destroy
if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}