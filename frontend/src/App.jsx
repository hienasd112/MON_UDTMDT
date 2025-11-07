import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layouts & Pages
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductsPage from "./pages/ProductsPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import ProfilePage from "./pages/ProfilePage";
import AdminCouponList from "./pages/admin/AdminCouponList";
import MyOrdersPage from "./pages/MyOrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";

// Import 2 "Người gác cổng"
import ProtectedRoute from "./components/ProtectedRoute"; // Bảo vệ khách hàng
import AdminRoute from "./components/AdminRoute";       // Bảo vệ Admin

// --- ADMIN Imports ---
import AdminLayout from "./components/AdminLayout";
import AdminProductList from "./pages/admin/AdminProductList";
import AdminProductEdit from "./pages/admin/AdminProductEdit";
import AdminOrderList from "./pages/admin/AdminOrderList";
import AdminUserList from "./pages/admin/AdminUserList";

export default function App() {
  return (
    <Routes>
      {/* === 1. Auth Routes (Trang đăng nhập/đăng ký, không có layout) === */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* === 2. Admin Routes (Bảo vệ bởi AdminRoute) === */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/products" replace />} />
          <Route path="products" element={<AdminProductList />} />
          <Route path="products/:id/edit" element={<AdminProductEdit />} />
          <Route path="orders" element={<AdminOrderList />} />
          <Route path="users" element={<AdminUserList />} />

          <Route path="coupons" element={<AdminCouponList />} />
        </Route>
      </Route>

      {/* === 3. Customer Routes (Dùng Layout chung) === */}
      <Route path="/" element={<Layout />}>
        
        {/* --- Public Routes (Ai cũng xem được) --- */}
        <Route index element={<Home />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} /> {/* Ai cũng xem được giỏ hàng */}
        <Route path="products" element={<ProductsPage />} />
        <Route path="order-success" element={<OrderSuccessPage />} /> {/* Trang thành công là public */}

        {/* --- Shared Route (Cần đăng nhập) --- */}
        {/* Trang chi tiết đơn hàng đặt ở đây, API sẽ kiểm tra quyền */}
        <Route path="order/:id" element={<OrderDetailPage />} />

        {/* --- Private Routes (CHỈ KHÁCH HÀNG vào được) --- */}
        {/* Bọc các trang cần bảo vệ bằng ProtectedRoute */}
        <Route element={<ProtectedRoute />}> 
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="my-orders" element={<MyOrdersPage />} />
          {/* <Route path="my-orders" element={<MyOrdersPage />} /> */}
        </Route>
        
      </Route>
      
    </Routes>
  );
}