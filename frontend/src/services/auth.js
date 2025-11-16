import axios from "axios";

const API_URL = "/api/users"; // Base URL for user APIs

// Đăng ký
export const apiRegister = async (userData) => {
  try {
    const { data } = await axios.post(`${API_URL}/register`, userData);
    return data; // Trả về user data nếu thành công
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi không xác định khi đăng ký");
  }
};

// Đăng nhập
export const apiLogin = async (credentials) => {
  try {
    const { data } = await axios.post(`${API_URL}/login`, credentials);
    return data; // Trả về user data (bao gồm role)
  } catch (error) {
     throw new Error(error.response?.data?.message || "Email hoặc mật khẩu không đúng");
  }
};

// Đăng xuất
export const apiLogout = async () => {
  try {
    // Chỉ cần gọi API, không cần gửi data
    await axios.post(`${API_URL}/logout`);
    // Không cần trả về data
  } catch (error) {
     // Thường không cần xử lý lỗi ở đây, vì frontend sẽ xóa user state
     console.error("Lỗi gọi API logout:", error);
     // throw new Error("Lỗi khi đăng xuất"); 
  }
};

// --- HÀM LẤY PROFILE  ---
export const apiGetProfile = async () => {
  try {
    // API này yêu cầu cookie 'jwt' (được gửi tự động)
    const { data } = await axios.get(`${API_URL}/profile`);
    return data; // Trả về thông tin user ({ _id, fullName, email, role, phone, address })
  } catch (error) {
    // Nếu lỗi 401 (Unauthorized) -> chưa đăng nhập hoặc token hết hạn
    console.error("Lỗi lấy profile:", error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || "Không thể lấy thông tin người dùng.");
  }
};

// --- HÀM CẬP NHẬT PROFILE ---
export const apiUpdateProfile = async (profileData) => {
  try {
     // API này cũng yêu cầu cookie 'jwt'
    const { data } = await axios.put(`${API_URL}/profile`, profileData);
    return data; // Trả về thông tin user đã cập nhật
  } catch (error) {
     console.error("Lỗi cập nhật profile:", error.response?.data?.message || error.message);
     throw new Error(error.response?.data?.message || "Lỗi khi cập nhật thông tin.");
  }
};