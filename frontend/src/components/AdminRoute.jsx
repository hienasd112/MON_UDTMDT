import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AdminRoute = () => {
  const { user, isLoadingAuth } = useAuth();
  const location = useLocation();

  if (isLoadingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  // 1. ĐÃ ĐĂNG NHẬP VÀ LÀ ADMIN?
  // -> OK, cho phép truy cập (vào /admin/products, /admin/orders...)
  if (user && user.role === 'admin') {
    return <Outlet />;
  }
  
  // 2. ĐÃ ĐĂNG NHẬP, NHƯNG LÀ KHÁCH HÀNG?
  // -> Không cho phép. Chuyển về trang chủ
  if (user) {
     return <Navigate to="/" replace />;
  }

  // 3. CHƯA ĐĂNG NHẬP?
  // -> Chuyển về trang /login
  return <Navigate to="/login" replace state={{ from: location }} />;
};

export default AdminRoute;