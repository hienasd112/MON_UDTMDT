import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Component này dùng để BẢO VỆ TRANG CỦA KHÁCH HÀNG (VD: /checkout, /profile)
// Nó sẽ KHÔNG cho Admin vào.
const ProtectedRoute = () => {
  const { user, isLoadingAuth } = useAuth();
  const location = useLocation(); // Lấy vị trí hiện tại (để chuyển hướng lại sau khi login)

  // 1. Chờ kiểm tra (AuthContext đang gọi API /profile)
  if (isLoadingAuth) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        Đang tải...
      </div>
    );
  }

  // 2. Đã kiểm tra xong
  
  // 2a. NẾU KHÔNG CÓ USER (chưa đăng nhập)
  if (!user) {
    console.log("ProtectedRoute: Chưa đăng nhập. Chuyển hướng về /login.");
    // Chuyển về trang /login và lưu lại trang họ muốn vào
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 2b. NẾU CÓ USER (đã đăng nhập)
  
  // Chuyển vai trò thành chữ thường để so sánh (tránh lỗi do viết hoa 'Admin')
  const userRole = user.role ? user.role.toLowerCase() : 'user'; 

  // NẾU VAI TRÒ LÀ 'admin'
  if (userRole === 'admin') {
    // KHÔNG cho phép. Chuyển hướng Admin về trang quản lý của họ
    console.log(`ProtectedRoute: Phát hiện Admin. Chuyển hướng về /admin/products.`);
    return <Navigate to="/admin/products" replace />;
  }
  
  // NẾU VAI TRÒ KHÔNG PHẢI 'admin' (là khách hàng)
  // OK, cho phép vào trang (/checkout, /profile, ...)
  return <Outlet />; // Hiển thị component con (CheckoutPage, ProfilePage...)
};

export default ProtectedRoute;