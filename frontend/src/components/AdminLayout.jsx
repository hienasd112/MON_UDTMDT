import React, { useState } from 'react'; 
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
// Import các icon cần thiết
import {
  ShoppingBag,
  BarChart2,
  Users,
  LogOut,
  Home,
  Settings,
  Ticket, 
  Menu,   
  X,      
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// --- Component NavLink  ---
// Giúp tạo link trong sidebar và tự động highlight khi active
const AdminNavLink = ({ to, icon, children, onClick }) => (
  <NavLink
    to={to}
    end // Chỉ active khi khớp chính xác
    onClick={onClick} // Thêm onClick để đóng mobile menu
    className={({ isActive }) =>
      `flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white hover:bg-gray-700 ${
        isActive ? '!bg-emerald-600 !text-white font-semibold shadow-inner' : ''
      }`
    }
  >
    {icon}
    {children}
  </NavLink>
);


// --- Component Layout chính ---
const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login'); // Chuyển về trang login sau khi logout
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // --- Sidebar Content (Nội dung dùng chung cho cả Mobile và Desktop) ---
  const SidebarContent = () => (
    <div className="flex h-full max-h-screen flex-col gap-2">
      {/* Header Sidebar */}
      <div className="flex h-16 items-center border-b border-gray-700 px-6">
        <Link to="/admin" className="flex items-center gap-2 font-semibold text-white">
          <Settings className="h-6 w-6 text-emerald-500" />
          <span className="">Admin Panel</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-auto px-3 py-4 text-sm font-medium lg:px-4 space-y-1">
        <AdminNavLink to="/admin/products" icon={<ShoppingBag size={18} />} onClick={toggleMobileMenu}>
          Quản lý Sản phẩm
        </AdminNavLink>
        <AdminNavLink to="/admin/orders" icon={<BarChart2 size={18} />} onClick={toggleMobileMenu}>
          Quản lý Đơn hàng
        </AdminNavLink>
        <AdminNavLink to="/admin/users" icon={<Users size={18} />} onClick={toggleMobileMenu}>
          Quản lý Users
        </AdminNavLink>
        
        {/* ---  LINK MÃ GIẢM GIÁ --- */}
        <AdminNavLink to="/admin/coupons" icon={<Ticket size={18} />} onClick={toggleMobileMenu}>
          Quản lý Mã giảm giá
        </AdminNavLink>
        
      </nav>

      {/* Footer Sidebar (Thông tin User & Đăng xuất) */}
      <div className="mt-auto border-t border-gray-700 p-4">
         <div className="mb-2">
            <p className="text-xs text-gray-400">Đã đăng nhập với</p>
            <p className="font-semibold text-emerald-400 truncate" title={user?.email}>{user?.email || 'N/A'}</p>
         </div>
         <Link 
            to="/" 
            className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-700 px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
            onClick={toggleMobileMenu}
         >
            <Home size={16} /> Quay lại trang chủ
         </Link>
         <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-red-800/50 px-3 py-2 text-sm text-red-300 hover:bg-red-700/60 hover:text-white"
         >
            <LogOut size={16} /> Đăng xuất
         </button>
      </div>
    </div>
  );


  // --- Render ---
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
      
      {/* --- Sidebar (Bản Desktop) --- */}
      <aside className="hidden border-r border-gray-700 bg-gray-900 text-white md:block">
        <SidebarContent />
      </aside>

      {/* --- Main Content Area (Phần nội dung chính) --- */}
      <main className="flex flex-1 flex-col bg-gray-100">
        
        {/* Header (Bản Mobile - có nút Menu) */}
        <header className="flex h-14 items-center gap-4 border-b bg-white px-4 md:hidden">
            <button
                onClick={toggleMobileMenu}
                className="text-gray-600 hover:text-gray-900"
                aria-label="Mở/Đóng menu"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/admin" className="flex items-center gap-2 font-semibold text-lg">
                <Settings className="h-5 w-5 text-emerald-600" />
                <span className="">Admin</span>
            </Link>
            {/* (Có thể thêm icon user hoặc logout ở đây cho mobile) */}
        </header>

        {/* --- Sidebar (Bản Mobile - Dạng Pop-up) --- */}
        {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 z-40 bg-black/60 md:hidden" 
              onClick={toggleMobileMenu} // Click nền đen để đóng
            >
              <aside 
                className="absolute left-0 top-0 h-full w-[280px] border-r border-gray-700 bg-gray-900 text-white z-50"
                onClick={(e) => e.stopPropagation()} // Ngăn click bên trong sidebar đóng menu
              >
                  <SidebarContent />
              </aside>
            </div>
        )}

         {/* Nội dung chính (các trang admin sẽ được render ở đây) */}
         <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            <Outlet /> {/* Đây là nơi AdminProductList, AdminOrderList... được hiển thị */}
         </div>
      </main>
    </div>
  );
};

export default AdminLayout;