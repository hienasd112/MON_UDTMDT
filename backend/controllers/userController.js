import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import asyncHandler from 'express-async-handler';

// @desc   Đăng ký người dùng mới
// @route  POST /api/users/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  // Basic validation
  if (!fullName || !email || !password) {
      res.status(400);
      throw new Error('Vui lòng điền đầy đủ thông tin.');
  }
   if (password.length < 6) {
      res.status(400);
      throw new Error('Mật khẩu phải có ít nhất 6 ký tự.');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("Địa chỉ email đã được sử dụng");
  }

  const user = await User.create({
    fullName,
    email,
    password, 
  });

  if (user) {
    generateToken(res, user._id); 
    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(400);
    throw new Error("Dữ liệu người dùng không hợp lệ");
  }
});

// @desc   Đăng nhập người dùng
// @route  POST /api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => { 
  console.log("--- BẮT ĐẦU XỬ LÝ LOGIN ---"); 
  const { email, password } = req.body;
  console.log(`Email nhận được: ${email}`); 

  if (!email || !password) {
     res.status(400);
     throw new Error('Vui lòng nhập email và mật khẩu.');
  }

  try {
    // 1. Tìm user bằng email
    console.log("Bước 1: Đang tìm user bằng email..."); 
    const user = await User.findOne({ email });
    console.log("Bước 1: Tìm user xong.", user ? `Tìm thấy user ID: ${user._id}` : "Không tìm thấy user."); 

    // 2. Kiểm tra user và mật khẩu
    if (user) {
      console.log("Bước 2: Đang so sánh mật khẩu..."); 
      const isMatch = await user.matchPassword(password);
      console.log("Bước 2: So sánh mật khẩu xong.", `Kết quả: ${isMatch}`);

      if (isMatch) {
        // 3. Tạo token và gửi cookie
        console.log("Bước 3: Đang tạo token..."); 
        generateToken(res, user._id);
        console.log("Bước 3: Tạo token xong."); 

        // 4. Trả về thông tin user
        console.log("Bước 4: Đang gửi response..."); 
        res.status(200).json({
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        });
        console.log("--- KẾT THÚC XỬ LÝ LOGIN (Thành công) ---"); 
      } else {
        console.log("Lỗi: Mật khẩu không khớp."); // <-- LOG LỖI MK
        res.status(401); 
        throw new Error("Email hoặc mật khẩu không đúng");
      }
    } else {
      console.log("Lỗi: Email không tồn tại."); // <-- LOG LỖI EMAIL
      res.status(401); 
      throw new Error("Email hoặc mật khẩu không đúng");
    }
  } catch (error) {
    // Log lỗi bị bắt bởi asyncHandler hoặc throw new Error
    console.error("--- LỖI TRONG QUÁ TRÌNH LOGIN ---:", error.message);
    // asyncHandler sẽ tự xử lý status code và response lỗi
    throw error; // Ném lại lỗi để asyncHandler xử lý
  }
});

// @desc   Đăng xuất người dùng
// @route  POST /api/users/logout
// @access Private (cần protect để biết ai logout, nhưng thực ra chỉ cần xóa cookie)
const logoutUser = asyncHandler(async (req, res) => {
  // Xóa cookie 'jwt' bằng cách set thời gian hết hạn về quá khứ
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV !== 'development', 
    sameSite: 'strict',
  });
  console.log("User logged out, cookie cleared.");
  res.status(200).json({ message: "Đăng xuất thành công" });
});

// @desc   Lấy thông tin profile người dùng đang đăng nhập
// @route  GET /api/users/profile
// @access Private
const getUserProfile = asyncHandler(async (req, res) => {
  // req.user được gán từ middleware 'protect'
  const user = await User.findById(req.user._id).select('-password'); // Lấy user từ DB để đảm bảo thông tin mới nhất

  if (user) {
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
    });
  } else {
    res.status(404);
    throw new Error("Không tìm thấy người dùng");
  }
});

// @desc   Cập nhật thông tin profile người dùng đang đăng nhập
// @route  PUT /api/users/profile
// @access Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.fullName = req.body.fullName || user.fullName;
    user.email = req.body.email || user.email; 
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;

    // Chỉ cập nhật mật khẩu nếu người dùng nhập mật khẩu mới
    if (req.body.password) {
       if (req.body.password.length < 6) {
           res.status(400);
           throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự.');
       }
      user.password = req.body.password; // Model pre-save hook sẽ has
    }

    try {
        const updatedUser = await user.save();
        // Trả về thông tin đã cập nhật (không bao gồm token mới)
        res.status(200).json({
          _id: updatedUser._id,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          role: updatedUser.role,
          phone: updatedUser.phone,
          address: updatedUser.address,
        });
    } catch (error) {
         if (error.code === 11000) { 
             res.status(400);
             throw new Error("Địa chỉ email này đã được sử dụng.");
         }
         throw error; 
    }
  } else {
    res.status(404);
    throw new Error("Không tìm thấy người dùng");
  }
});


// --- HÀM CHO ADMIN ---

// @desc    Lấy tất cả người dùng (Admin)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.status(200).json(users);
});

// @desc    Lấy thông tin 1 người dùng theo ID (Admin)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy người dùng');
  }
});

// @desc    Cập nhật thông tin người dùng (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.fullName = req.body.fullName || user.fullName;
    user.email = req.body.email || user.email; // Admin đổi email
    user.role = req.body.role || user.role; // Admin có thể đổi role

    try {
        const updatedUser = await user.save();
        res.status(200).json({
          _id: updatedUser._id,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          role: updatedUser.role,
        });
    } catch (error) {
         if (error.code === 11000) {
             res.status(400);
             throw new Error("Địa chỉ email này đã được sử dụng.");
         }
         throw error;
    }
  } else {
    res.status(404);
    throw new Error('Không tìm thấy người dùng');
  }
});

// @desc    Xóa người dùng (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user._id.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('Không thể xóa tài khoản của chính bạn.');
    }
    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Không thể xóa tài khoản Admin khác.');
    }

    await User.deleteOne({ _id: user._id });
    console.log("✅ Người dùng đã xóa:", req.params.id);
    res.status(200).json({ message: 'Người dùng đã được xóa' });
  } else {
    res.status(404);
    throw new Error('Không tìm thấy người dùng');
  }
});

export {
  registerUser,
  loginUser, 
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};