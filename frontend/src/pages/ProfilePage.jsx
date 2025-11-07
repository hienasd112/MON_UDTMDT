import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiGetProfile, apiUpdateProfile } from '../services/auth'; 
import { AlertCircle, CheckCircle, Save } from 'lucide-react';

// Spinner Icon
const SpinnerIcon = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);


export default function ProfilePage() {
  const { user, login } = useAuth(); // Lấy user hiện tại và hàm login để cập nhật context

  // State cho form
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',        // Mật khẩu mới
    confirmPassword: '', // Xác nhận mật khẩu mới
  });

  const [loading, setLoading] = useState(false); // Loading khi submit
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Tải thông tin profile khi trang load
  useEffect(() => {
    const loadProfile = async () => {
      // Chỉ tải nếu đã đăng nhập và chưa có data trong form
      if (user && !formData.email) {
        try {
          const profileData = await apiGetProfile(); // Gọi API lấy profile
          setFormData({
            fullName: profileData.fullName || '',
            email: profileData.email || '',
            phone: profileData.phone || '',
            address: profileData.address || '',
            password: '', // Luôn reset password fields
            confirmPassword: '',
          });
        } catch (err) {
          console.error("Lỗi tải profile:", err);
          setError("Không thể tải thông tin tài khoản.");
        }
      } else if (user) {
          // Nếu user trong context thay đổi (ví dụ sau khi update), cập nhật form
           setFormData(prev => ({
             ...prev, // Giữ lại password đang gõ
             fullName: user.fullName || '',
             email: user.email || '',
             phone: user.phone || '',
             address: user.address || '',
           }));
      }
    };
    loadProfile();
  }, [user]); // Chạy lại khi user (từ context) thay đổi

  // 2. Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setError(''); // Xóa lỗi cũ khi bắt đầu sửa
    setSuccess(''); // Xóa thông báo thành công cũ
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // --- Validate mật khẩu ---
    if (formData.password && formData.password.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);

    try {
      // Tạo đối tượng data chỉ chứa các trường cần gửi đi
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      };
      // Chỉ gửi password nếu người dùng đã nhập
      if (formData.password) {
        updateData.password = formData.password;
      }

      // Gọi API cập nhật profile
      const updatedUser = await apiUpdateProfile(updateData);

      // Cập nhật lại user trong AuthContext
      login(updatedUser); // Dùng hàm login để cập nhật state toàn cục

      setSuccess("Cập nhật thông tin thành công!");
      // Reset password fields sau khi thành công
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));

    } catch (err) {
      console.error("Lỗi cập nhật profile:", err);
      setError(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Thông tin tài khoản</h1>

      {/* Thông báo lỗi/thành công */}
      {error && (
        <div className="mb-6 text-sm text-red-700 bg-red-100 p-4 rounded-lg border border-red-300 flex items-center gap-2">
          <AlertCircle size={18} /><span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto font-bold">&times;</button>
        </div>
      )}
      {success && (
        <div className="mb-6 text-sm text-green-700 bg-green-100 p-4 rounded-lg border border-green-300 flex items-center gap-2">
          <CheckCircle size={18} /><span>{success}</span>
          <button onClick={() => setSuccess('')} className="ml-auto font-bold">&times;</button>
        </div>
      )}

      {/* Form cập nhật */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 md:p-8 rounded-lg shadow">
        <Input label="Họ và tên" name="fullName" value={formData.fullName} onChange={handleChange} required />
        <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        <Input label="Số điện thoại" name="phone" value={formData.phone} onChange={handleChange} />
        <Input label="Địa chỉ" name="address" value={formData.address} onChange={handleChange} placeholder="Số nhà, đường, phường/xã..." />

        {/* Phần đổi mật khẩu */}
        <fieldset className="border-t pt-6">
           <legend className="text-base font-medium text-gray-900 mb-1">Đổi mật khẩu (Để trống nếu không đổi)</legend>
           <div className="space-y-4">
             <Input label="Mật khẩu mới" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Ít nhất 6 ký tự"/>
             <Input label="Xác nhận mật khẩu mới" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Nhập lại mật khẩu mới"/>
           </div>
        </fieldset>

        {/* Nút Lưu */}
        <div className="border-t pt-6 text-right">
           <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${loading ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              {loading ? ( <><SpinnerIcon /> Đang lưu...</> ) : ( <><Save size={18} /> Lưu thay đổi</> )}
            </button>
        </div>
      </form>
    </div>
  );
}

// Component Input
const Input = ({ label, name, type = 'text', value, onChange, required = false, placeholder = '' }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type} id={name} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder}
      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm disabled:opacity-50"
    />
  </div>
);