import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast'; // Import toast để hiển thị thông báo
import { Send } from 'lucide-react'; // Import icon Send

export default function Footer() {
  const currentYear = new Date().getFullYear(); 
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [loading, setLoading] = useState(false); // Thêm state loading

  // --- HÀM XỬ LÝ ĐĂNG KÝ NHẬN TIN ---
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault(); // Ngăn trang reload
    if (!newsletterEmail) {
      toast.error("Vui lòng nhập email của bạn.");
      return;
    }
    
    setLoading(true); // Bắt đầu loading

    // Dùng toast.promise để tự động xử lý loading/success/error
    const promise = axios.post('/api/newsletter/subscribe', {
      email: newsletterEmail
    });

    toast.promise(promise, {
      loading: 'Đang gửi yêu cầu...',
      success: (res) => {
        setLoading(false);
        setNewsletterEmail(''); // Xóa email trong ô input
        // Trả về tin nhắn từ API (vd: "Đăng ký thành công!")
        return res.data.message || 'Đăng ký nhận tin thành công!';
      },
      error: (err) => {
        setLoading(false);
        // Trả về lỗi từ API (vd: "Email đã tồn tại")
        return err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
      }
    });
  };

  return (
    <footer className="mt-16 bg-gray-800 text-gray-300">
      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 py-12 md:grid-cols-4 lg:px-8">
        
        {/* Section 1: Brand Info */}
        <div className="md:col-span-2 lg:col-span-1"> {/* Điều chỉnh cột cho đẹp hơn */}
          <h4 className="mb-4 text-xl font-bold text-white">WatchStore</h4>
          <p className="text-sm">
            Chuyên cung cấp đồng hồ chính hãng từ các thương hiệu hàng đầu thế giới.
          </p>
        </div>

        {/* Section 2: Shopping Links */}
        <div>
          <h5 className="mb-4 text-lg font-semibold text-white">Mua sắm</h5>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="transition hover:text-white hover:underline">Trang chủ</Link></li>
            <li><Link to="/products" className="transition hover:text-white hover:underline">Tất cả sản phẩm</Link></li>
            <li><Link to="/products?movement=Automatic" className="transition hover:text-white hover:underline">Đồng hồ Automatic</Link></li>
            <li><Link to="/products?brand=G-Shock" className="transition hover:text-white hover:underline">Thương hiệu G-Shock</Link></li>
          </ul>
        </div>

        {/* Section 3: Support Links */}
        <div>
          <h5 className="mb-4 text-lg font-semibold text-white">Hỗ trợ</h5>
          <ul className="space-y-2 text-sm">
            <li><Link to="/contact" className="transition hover:text-white hover:underline">Liên hệ</Link></li>
            <li><Link to="/faq" className="transition hover:text-white hover:underline">Câu hỏi thường gặp</Link></li>
            <li><Link to="/policy/warranty" className="transition hover:text-white hover:underline">Chính sách bảo hành</Link></li>
            <li><Link to="/policy/return" className="transition hover:text-white hover:underline">Chính sách đổi trả</Link></li>
          </ul>
        </div>

        {/* Section 4: Newsletter Signup */}
        <div>
          <h5 className="mb-4 text-lg font-semibold text-white">Đăng ký nhận tin</h5>
          <p className="mb-3 text-sm">Nhận thông tin mới nhất về sản phẩm và khuyến mãi.</p>
          
          {/* Form đã được kết nối với handleNewsletterSubmit */}
          <form className="flex" onSubmit={handleNewsletterSubmit}>
            <input
              type="email"
              value={newsletterEmail} // <-- Kết nối state
              onChange={(e) => setNewsletterEmail(e.target.value)} // <-- Kết nối state
              placeholder="Email của bạn"
              required
              disabled={loading} // <-- Disable khi đang gửi
              className="w-full rounded-l-md border-none px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-70"
              aria-label="Email for newsletter"
            />
            <button
              type="submit"
              disabled={loading} // <-- Disable khi đang gửi
              className="rounded-r-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-70"
            >
              {/* Thay đổi icon khi loading */}
              {loading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Send size={18} /> // Icon Gửi
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-gray-900 py-4 text-center mt-8 border-t border-gray-700">
        <p className="text-sm text-gray-500">
          © {currentYear} WatchStore. Đã đăng ký bản quyền.
        </p>
      </div>
    </footer>
  );
}