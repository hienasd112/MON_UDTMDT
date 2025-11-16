import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; 
import { apiRegister } from "../services/auth";
export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth(); // Lấy hàm login từ AuthContext
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation cơ bản
    if (!fullName || !email || !password || !confirmPassword) {
       setError("Vui lòng điền đầy đủ thông tin.");
       return;
    }
    if (password.length < 6) {
       setError("Mật khẩu phải có ít nhất 6 ký tự.");
       return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setError(""); 
    setLoading(true);

    try {
      // 1. Gọi API đăng ký
      const userData = await apiRegister({ fullName, email, password });

      // 2. Cập nhật state toàn cục (tự động login)
      login(userData);

      // 3. Điều hướng về trang chủ
      navigate("/");

    } catch (err) {
      // Hiển thị lỗi từ API (ví dụ: email đã tồn tại)
      setError(err.message || "Đã xảy ra lỗi trong quá trình đăng ký.");
      console.error("Lỗi đăng ký:", err);
    } finally {
      setLoading(false); // Dừng loading bất kể thành công hay thất bại
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 py-12">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-lg">
        <h2 className="text-center text-3xl font-bold text-emerald-700">
          Đăng ký tài khoản
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Hiển thị lỗi */}
          {error && (
            <p className="rounded-md bg-red-100 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Input Họ tên */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700"
            >
              Họ và tên
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading} // Disable khi đang loading
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 disabled:opacity-50"
              placeholder="Nguyễn Văn A"
            />
          </div>

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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 disabled:opacity-50"
              placeholder="ban@email.com"
            />
          </div>

          {/* Input Mật khẩu */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Mật khẩu (ít nhất 6 ký tự)
            </label>
            <input
              id="password"
              type="password"
              required
              minLength="6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          {/* Input Xác nhận Mật khẩu */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Xác nhận mật khẩu
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          {/* Nút Đăng ký */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </div>
        </form>

        {/* Link tới trang Đăng nhập */}
        <p className="text-center text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="font-medium text-emerald-600 hover:text-emerald-500 hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}