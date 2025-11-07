import React from "react";
import { Link } from "react-router-dom"; 

export default function Footer() {
  const currentYear = new Date().getFullYear(); 

  return (
    <footer className="mt-16 bg-gray-800 text-gray-300">
      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 py-12 md:grid-cols-4 lg:px-8">
        {/* Section 1: Brand Info */}
        <div>
          <h4 className="mb-4 text-xl font-bold text-white">WatchStore</h4>
          <p className="text-sm">
            Chuyên cung cấp đồng hồ chính hãng từ các thương hiệu hàng đầu thế giới. Uy tín, chất lượng, và dịch vụ tận tâm.
          </p>
          {/* Add social media icons here if needed */}
        </div>

        {/* Section 2: Shopping Links */}
        <div>
          <h5 className="mb-4 text-lg font-semibold text-white">Mua sắm</h5>
          <ul className="space-y-2 text-sm">
            <li><Link to="/products?movement=Automatic" className="transition hover:text-white">Đồng hồ Automatic</Link></li>
            <li><Link to="/products?movement=Quartz" className="transition hover:text-white">Đồng hồ Quartz</Link></li>
            <li><Link to="/products?brand=Seiko" className="transition hover:text-white">Thương hiệu Seiko</Link></li>
            <li><Link to="/products?brand=Tissot" className="transition hover:text-white">Thương hiệu Tissot</Link></li>
             <li><Link to="/products?brand=G-Shock" className="transition hover:text-white">Thương hiệu G-Shock</Link></li>
          </ul>
        </div>

        {/* Section 3: Support Links */}
        <div>
          <h5 className="mb-4 text-lg font-semibold text-white">Hỗ trợ</h5>
          <ul className="space-y-2 text-sm">
            <li><Link to="/faq" className="transition hover:text-white">Câu hỏi thường gặp (FAQ)</Link></li>
            <li><Link to="/policy/warranty" className="transition hover:text-white">Chính sách bảo hành</Link></li>
            <li><Link to="/policy/return" className="transition hover:text-white">Chính sách đổi trả</Link></li>
            <li><Link to="/contact" className="transition hover:text-white">Liên hệ</Link></li>
          </ul>
        </div>

        {/* Section 4: Newsletter Signup */}
        <div>
          <h5 className="mb-4 text-lg font-semibold text-white">Đăng ký nhận tin</h5>
          <p className="mb-3 text-sm">Nhận thông tin mới nhất về sản phẩm và các chương trình khuyến mãi.</p>
          <form className="flex" onSubmit={(e) => e.preventDefault()}> {/* Prevent default form submission */}
            <input
              type="email"
              placeholder="Email của bạn"
              required // Basic HTML5 validation
              className="w-full rounded-l-md border-none px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Email for newsletter"
            />
            <button
              type="submit"
              className="rounded-r-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Đăng ký
            </button>
          </form>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-gray-900 py-4 text-center">
        <p className="text-sm text-gray-500">
          © {currentYear} WatchStore. Đã đăng ký bản quyền.
        </p>
      </div>
    </footer>
  );
}