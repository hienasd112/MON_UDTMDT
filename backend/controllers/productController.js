import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";

// --- HÀM LẤY SẢN PHẨM (getProducts, getProductById) ---
// @desc   Lấy tất cả sản phẩm
// @route  GET /api/products
const getProducts = async (req, res) => {
  try {
    const { keyword, brand, movement } = req.query;
    const filter = {};

    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { sku: { $regex: keyword, $options: "i" } },
      ];
    }

    if (brand) {
      const brandCategory = await Category.findOne({ name: { $regex: brand, $options: 'i' } });
      if (brandCategory) {
        filter.category = brandCategory._id;
      } else {
        return res.json({ products: [] });
      }
    }
    
    if (movement) {
      filter.movement = { $regex: movement, $options: "i" };
    }

    const products = await Product.find(filter).populate("category");
    res.status(200).json({ products });
  } catch (error) {
    console.error("❌ LỖI TẠI getProducts:", error);
    res.status(500).json({ message: "Server gặp lỗi", error: error.message });
  }
};

// @desc   Lấy 1 sản phẩm
// @route  GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
  } catch (error) {
     console.error("❌ LỖI TẠI getProductById:", error);
     res.status(500).json({ message: "Server gặp lỗi", error: error.message });
  }
};

// --- HÀM THÊM/SỬA/XÓA ---

// @desc   Tạo sản phẩm mới (sản phẩm mẫu)
// @route  POST /api/products
// @access Private/Admin
const createProduct = async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ message: "Không thể xác định người dùng admin." });
  }

  try {
    const sampleCategory = await Category.findOne();
    if (!sampleCategory) {
      console.error("❌ Lỗi tạo SP: Không tìm thấy Category nào.");
      return res.status(400).json({ message: "Lỗi: Cần có ít nhất 1 danh mục trong database. Hãy chạy seeder." });
    }

    const product = new Product({
      user: req.user._id,
      name: "Sản phẩm mẫu",
      sku: `SAMPLE-SKU-${Date.now()}`,
      description: "Mô tả sản phẩm mẫu",
      price: 0,
      stock: 0,
      category: sampleCategory._id,
      movement: "Chưa rõ",
      caseMaterial: "Chưa rõ",
      strapMaterial: "Chưa rõ",
      images: ["/uploads/sample.jpg"],
      // Cung cấp giá trị mặc định nếu model yêu cầu
      waterResistance: "N/A",
      caseSize: 0,
      glassType: "N/A"
    });

    const createdProduct = await product.save();
    console.log("✅ Sản phẩm mẫu đã tạo:", createdProduct._id);
    res.status(201).json(createdProduct);

  } catch (error) {
     console.error("❌ Lỗi nghiêm trọng khi tạo sản phẩm:", error);
     if (error.name === 'ValidationError') {
       const messages = Object.values(error.errors).map(val => val.message);
       return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: messages });
     }
     res.status(500).json({ message: "Lỗi server khi tạo sản phẩm", error: error.message });
  }
};

// @desc   Cập nhật sản phẩm
// @route  PUT /api/products/:id
// @access Private/Admin
const updateProduct = async (req, res) => {
  const {
    name, price, description, images, category, // ID category
    stock, movement, caseMaterial, strapMaterial, waterResistance, caseSize, glassType, sku
   } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Cập nhật từng trường nếu có giá trị mới được gửi lên
      product.name = name ?? product.name;
      product.sku = sku ?? product.sku;
      product.price = price ?? product.price;
      product.description = description ?? product.description;
      product.images = images ?? product.images;
      product.category = category ?? product.category;
      product.stock = stock ?? product.stock;
      product.movement = movement ?? product.movement;
      product.caseMaterial = caseMaterial ?? product.caseMaterial;
      product.strapMaterial = strapMaterial ?? product.strapMaterial;
      product.waterResistance = waterResistance ?? product.waterResistance;
      product.caseSize = caseSize ?? product.caseSize;
      product.glassType = glassType ?? product.glassType;

      const updatedProduct = await product.save();
      console.log("✅ Sản phẩm đã cập nhật:", updatedProduct._id);
      res.status(200).json(updatedProduct);
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
  } catch (error) {
     console.error("❌ Lỗi cập nhật sản phẩm:", error);
      if (error.code === 11000 && error.keyPattern && error.keyPattern.sku) {
        return res.status(400).json({ message: "Mã SKU này đã tồn tại." });
      }
       if (error.name === 'ValidationError') {
       const messages = Object.values(error.errors).map(val => val.message);
       return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: messages });
     }
     res.status(500).json({ message: "Lỗi server khi cập nhật sản phẩm", error: error.message });
  }
};

// @desc   Xóa sản phẩm
// @route  DELETE /api/products/:id
// @access Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      console.log("✅ Sản phẩm đã xóa:", req.params.id);
      res.status(200).json({ message: "Sản phẩm đã được xóa" });
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
  } catch (error) {
     console.error("❌ Lỗi xóa sản phẩm:", error);
     res.status(500).json({ message: "Lỗi server khi xóa sản phẩm", error: error.message });
  }
};

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};