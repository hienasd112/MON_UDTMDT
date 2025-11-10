import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, LogOut, Menu, X, Settings, ListOrdered } from "lucide-react"; 
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { cartCount } = useCart();
  const { user, logout } = useAuth(); 
  const [keyword, setKeyword] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword) {
      navigate(`/products?keyword=${encodeURIComponent(trimmedKeyword)}`);
      setKeyword("");
      setIsMobileMenuOpen(false);
    } else {
      navigate("/products");
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Lấy tên ngắn gọn
  const getShortName = (fullName) => {
      if (!fullName) return "Tài khoản";
      return fullName.split(' ')[0]; 
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="text-2xl sm:text-3xl font-bold text-emerald-700" onClick={closeMobileMenu}>
          WatchStore
        </Link>

        {/* Menu Desktop */}
         <div className="hidden items-center gap-4 lg:gap-6 md:flex">
          <NavLinkStyled to="/">Trang chủ</NavLinkStyled>
          <NavLinkStyled to="/products?brand=Seiko">Seiko</NavLinkStyled>
          <NavLinkStyled to="/products?brand=Tissot">Tissot</NavLinkStyled>
          <NavLinkStyled to="/products?brand=G-Shock">G-Shock</NavLinkStyled>
          <NavLinkStyled to="/products?movement=Automatic">Automatic</NavLinkStyled>
          <NavLinkStyled to="/products">Tất cả</NavLinkStyled>
          {user && user.role === 'admin' && (
             <NavLinkStyled to="/admin/products" className="flex items-center gap-1 text-purple-600">
               <Settings size={16}/> Admin
             </NavLinkStyled>
           )}
        </div>

        {/* Icons bên phải & Auth */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Form tìm kiếm (Desktop) */}
          <form onSubmit={handleSearchSubmit} className="hidden items-center md:flex">
             {/* ... input và button search ... */}
             <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm kiếm..." className="w-28 lg:w-40 rounded-l-md border border-gray-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all duration-300 focus:w-40 lg:focus:w-56"/>
             <button type="submit" aria-label="Tìm kiếm" className="rounded-r-md border border-l-0 border-gray-300 bg-gray-100 px-3 py-1.5 text-gray-600 hover:bg-gray-200"> <Search size={18} /> </button>
          </form>

          {/* Icon Giỏ hàng */}
          <Link to="/cart" aria-label={`Giỏ hàng (${cartCount} sản phẩm)`} className="relative text-gray-600 hover:text-emerald-700 p-1">
            {/* ... icon giỏ hàng và số lượng ... */}
             <ShoppingCart size={22} />
             {cartCount > 0 && ( <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-1 ring-white"> {cartCount > 9 ? '9+' : cartCount} </span> )}
          </Link>

          {/* --- User Auth (Desktop) - CÓ DROPDOWN --- */}
          <div className="hidden items-center gap-2 md:flex">
             {user ? (
                // Nếu đã đăng nhập -> Hiển thị Dropdown
                <div className="relative group"> {/* Thêm group để hover */}
                    {/* Nút chính (Tên user) */}
                     <button
                       className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                       title={user.fullName || "Tài khoản của bạn"}
                     >
                       <User size={18} className="text-emerald-700"/>
                       <span>{getShortName(user.fullName)}</span>
                       {/* (Optional: Thêm icon chevron down) */}
                       {/* <svg className="ml-1 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg> */}
                     </button>
                     
                     {/* Menu dropdown (Ẩn ban đầu, hiện khi hover) */}
                     <div className="absolute right-0 top-full w-48 hidden group-hover:block bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                        {/* Link Hồ sơ */}
                        <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-emerald-700">
                           <User size={16}/> Hồ sơ cá nhân
                        </Link>
                        
                        {/* --- LINK ĐƠN HÀNG CỦA TÔI --- */}
                        <Link to="/my-orders" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-emerald-700">
                           <ListOrdered size={16}/> Đơn hàng của tôi
                        </Link>
                        
                        <hr className="my-1 border-gray-100"/>
                        
                        {/* Nút Đăng xuất */}
                        <button onClick={logout} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                           <LogOut size={16}/> Đăng xuất
                        </button>
                     </div>
                  </div>
             ) : (
                // Nếu chưa đăng nhập -> Hiển thị nút Đăng nhập
                <Link
                  to="/login"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 shadow-sm"
                >
                  Đăng nhập
                </Link>
             )}
          </div>
          {/* --- KẾT THÚC User Auth --- */}


          {/* Nút Menu Mobile */}
          <button className="text-gray-600 hover:text-emerald-700 md:hidden p-1" onClick={toggleMobileMenu} aria-label="Mở menu" aria-expanded={isMobileMenuOpen}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* --- Menu Mobile --- */}
       {isMobileMenuOpen && (
          <div className="absolute left-0 top-full w-full bg-white shadow-lg md:hidden z-40 border-t border-gray-100 max-h-[calc(100vh-65px)] overflow-y-auto">
             <div className="flex flex-col space-y-1 p-4">
                 {/* ... (Search, Links Mobile khác) ... */}
                 <form onSubmit={handleSearchSubmit} className="mb-3 flex"> <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm kiếm sản phẩm..." className="flex-grow rounded-l-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"/> <button type="submit" aria-label="Tìm kiếm" className="rounded-r-md border border-l-0 border-gray-300 bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"> <Search size={18} /> </button> </form>
                 <MobileNavLink to="/" onClick={closeMobileMenu}>Trang chủ</MobileNavLink>
                 <MobileNavLink to="/products?brand=Seiko" onClick={closeMobileMenu}>Seiko</MobileNavLink>
                 <MobileNavLink to="/products?brand=Tissot" onClick={closeMobileMenu}>Tissot</MobileNavLink>
                 <MobileNavLink to="/products?brand=G-Shock" onClick={closeMobileMenu}>G-Shock</MobileNavLink>
                 <MobileNavLink to="/products?movement=Automatic" onClick={closeMobileMenu}>Automatic</MobileNavLink>
                 <MobileNavLink to="/products" onClick={closeMobileMenu}>Tất cả sản phẩm</MobileNavLink>
                 {user && user.role === 'admin' && ( <MobileNavLink to="/admin/products" onClick={closeMobileMenu} className="text-purple-600"> <Settings size={16}/> Trang Admin </MobileNavLink> )}

                 <hr className="my-2" />
                 
                 {/* --- Auth Links Mobile - CÓ LINK ĐƠN HÀNG --- */}
                 {user ? (
                   <>
                     <MobileNavLink to="/profile" onClick={closeMobileMenu}> <User size={18} /> Tài khoản ({getShortName(user.fullName)}) </MobileNavLink>
                     
                     {/* --- LINK ĐƠN HÀNG CỦA TÔI --- */}
                     <MobileNavLink to="/my-orders" onClick={closeMobileMenu}> <ListOrdered size={18} /> Đơn hàng của tôi </MobileNavLink>
                     {/* ---                         --- */}
                     
                     <button onClick={() => { logout(); closeMobileMenu(); }} className="w-full rounded px-3 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"> <LogOut size={18}/> Đăng xuất </button>
                   </>
                 ) : (
                   <Link to="/login" className="block rounded bg-emerald-600 px-3 py-2 text-center text-white font-medium hover:bg-emerald-700 mt-2" onClick={closeMobileMenu}> Đăng nhập / Đăng ký </Link>
                 )}
                 {/* --- KẾT THÚC Auth Links Mobile --- */}
             </div>
          </div>
       )}
    </header>
  );
}

// Component Link cho Desktop Menu
const NavLinkStyled = ({ to, children, className = '' }) => (
  <Link to={to} className={`text-sm lg:text-base text-gray-600 hover:text-emerald-700 transition font-medium ${className}`} >
    {children}
  </Link>
);

// Component Link cho Mobile Menu
const MobileNavLink = ({ to, onClick, children, className = '' }) => (
   <Link to={to} onClick={onClick} className={`flex items-center gap-2 rounded px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-emerald-700 font-medium ${className}`} >
     {children}
   </Link>
);