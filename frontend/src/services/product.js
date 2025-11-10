import axios from "axios";

const API_URL = "/api"; // Đã dùng Proxy

export const fetchProducts = async (params = {}) => {
  try {
    // params có thể là { keyword: 'rolex', brand: 'Seiko' }
    const { data } = await axios.get(`${API_URL}/products`, {
      params: params, // Gửi các tham số này lên backend
    });
    return data; // API trả về { products: [...] }
  } catch (error) {
    console.error("Lỗi khi tải sản phẩm:", error.response?.data?.message || error.message);
    throw error; 
  }
};

export const fetchProductById = async (id) => {
  try {
    const { data } = await axios.get(`${API_URL}/products/${id}`);
    return data;
  } catch (error) {
    console.error("Lỗi khi tải chi tiết sản phẩm:", error.response?.data?.message || error.message);
    throw error;
  }
};