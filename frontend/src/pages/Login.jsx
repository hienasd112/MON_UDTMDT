import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiLogin } from "../services/auth"; 
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth(); // Lấy hàm login từ AuthContext
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // 1. Gọi API đăng nhập
      const userData = await apiLogin({ email, password });

      // 2. Cập nhật state toàn cục (thông tin user)
      login(userData);

      // --- 3. ĐIỀU HƯỚNG DỰA TRÊN ROLE ---
      if (userData && userData.role === 'admin') {
        // Nếu là admin, chuyển đến trang quản lý sản phẩm
        navigate("/admin/products");
      } else {
        // Nếu là user thường, chuyển về trang chủ
        navigate("/");
      }
      // --- KẾT THÚC ĐIỀU HƯỚNG ---

    } catch (err) {
      // Hiển thị lỗi từ API (ví dụ: Sai mật khẩu)
      setError(err.message || "Email hoặc mật khẩu không đúng.");
      console.error("Lỗi đăng nhập:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 py-12">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-lg">
        <h2 className="text-center text-3xl font-bold text-emerald-700">
          Đăng nhập
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Hiển thị lỗi */}
          {error && (
            <p className="rounded-md bg-red-100 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Input Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email" // Gợi ý email đã lưu
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 disabled:opacity-50"
              placeholder="admin@gmail.com"
            />
          </div>

          {/* Input Mật khẩu */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password" // Gợi ý mật khẩu đã lưu
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 disabled:opacity-50"
              placeholder="123123"
            />
          </div>

          {/* Nút Đăng nhập */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </div>
        </form>

        {/* Link tới trang Đăng ký */}
        <p className="text-center text-sm text-gray-600">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="font-medium text-emerald-600 hover:text-emerald-500 hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}