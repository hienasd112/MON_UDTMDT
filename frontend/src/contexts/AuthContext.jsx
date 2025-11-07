import React, { createContext, useState, useEffect } from 'react';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Ban đầu chưa đăng nhập
  const [loading, setLoading] = useState(true); // Trạng thái kiểm tra đăng nhập ban đầu

 

  // Tạm thời bỏ qua kiểm tra ban đầu
   useEffect(() => {
     setLoading(false);
   }, []);

  // Hàm cập nhật state khi đăng nhập thành công
  const login = (userData) => {
    setUser(userData);
     console.log("User đã đăng nhập:", userData);
    // Có thể lưu vào localStorage nếu muốn (ít an toàn hơn cookie httpOnly)
    // localStorage.setItem('user', JSON.stringify(userData));
  };

  // Hàm xử lý đăng xuất
  const logout = async () => {
    try {
      // await apiLogout(); // Gọi API backend để xóa cookie
      setUser(null); // Xóa state user
      // localStorage.removeItem('user'); // Xóa khỏi localStorage nếu có lưu
      console.log("User đã đăng xuất.");
      // Có thể thêm navigate('/') ở đây nếu cần
    } catch (error) {
       console.error("Lỗi đăng xuất:", error);
    }
  };

  const value = {
    user,
    setUser, // Cung cấp setUser để cập nhật profile sau này
    login,
    logout,
    isAuthenticated: !!user, // Biến boolean tiện lợi
    isLoadingAuth: loading, // Trạng thái kiểm tra ban đầu
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};