import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Plus, AlertCircle, Ticket } from 'lucide-react';

// Component Spinner (Biểu tượng xoay)
const Spinner = ({ size = 'h-5 w-5', color = 'text-emerald-600' }) => (
  <svg className={`animate-spin ${size} ${color}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// --- Component Chính ---
export default function AdminCouponList() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true); // Loading danh sách
  const [error, setError] = useState('');
  
  // State cho form tạo mới
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percentage', // Mặc định là %
    discountValue: 10,
    expiryDate: '',
    minPurchase: 0,
  });
  const [loadingCreate, setLoadingCreate] = useState(false); // Loading nút "Thêm"
  const [loadingDelete, setLoadingDelete] = useState(null); // delete_<id>

  // Lấy danh sách coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await axios.get('/api/coupons');
      setCoupons(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải mã');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []); // Chạy 1 lần khi component mount

  // Xử lý thay đổi input form
  const handleFormChange = (e) => {
    const { name, value, type } = e.target;
    // Xóa lỗi cũ khi người dùng gõ
    setError(''); 
    setNewCoupon(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  // Xử lý Thêm
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setLoadingCreate(true);
    setError('');
    
    // Đảm bảo code là chữ IN HOA
    const dataToSend = { ...newCoupon, code: newCoupon.code.toUpperCase() };

    try {
      const { data: createdCoupon } = await axios.post('/api/coupons', dataToSend);
      setCoupons([createdCoupon, ...coupons]); // Thêm vào đầu danh sách
      // Reset form
      setNewCoupon({ code: '', discountType: 'percentage', discountValue: 10, expiryDate: '', minPurchase: 0 });
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tạo mã');
    } finally {
      setLoadingCreate(false);
    }
  };

  // Xử lý Xóa
  const handleDeleteCoupon = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa mã này?')) {
      setLoadingDelete(id);
      setError('');
      try {
        await axios.delete(`/api/coupons/${id}`);
        setCoupons(coupons.filter(c => c._id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi khi xóa mã');
      } finally {
        setLoadingDelete(null);
      }
    }
  };

  // Helper định dạng ngày
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');
  // Helper định dạng tiền
  const formatCurrency = (num) => num.toLocaleString('vi-VN') + ' ₫';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Quản lý Mã giảm giá</h1>

      {/* --- Form Thêm Mới --- */}
      <form onSubmit={handleCreateCoupon} className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Thêm mã mới</h2>
        {/* Hiển thị lỗi (nếu có) */}
        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-100 p-3 rounded-lg border border-red-300 flex items-center gap-2">
            <AlertCircle size={16} /> <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto font-bold">&times;</button>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Input label="Mã Code" name="code" value={newCoupon.code} onChange={handleFormChange} placeholder="VD: SALE10" required />
          <Select label="Loại giảm giá" name="discountType" value={newCoupon.discountType} onChange={handleFormChange}>
            <option value="percentage">Phần trăm (%)</option>
            <option value="fixed">Số tiền cố định (₫)</option>
          </Select>
          <Input label="Giá trị" name="discountValue" type="number" value={newCoupon.discountValue} onChange={handleFormChange} required min="0" />
          <Input label="Ngày hết hạn" name="expiryDate" type="date" value={newCoupon.expiryDate} onChange={handleFormChange} required />
          <Input label="Đơn tối thiểu (₫)" name="minPurchase" type="number" value={newCoupon.minPurchase} onChange={handleFormChange} min="0" />
        </div>
        <button
          type="submit"
          disabled={loadingCreate}
          className="mt-5 w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white shadow transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {loadingCreate ? <Spinner size="h-4 w-4" color="text-white"/> : <Plus size={18} />}
          {loadingCreate ? 'Đang thêm...' : 'Thêm mã'}
        </button>
      </form>

      {/* --- Danh sách Mã --- */}
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Danh sách mã hiện có</h2>
      {loading ? (
        <div className="text-center py-10"><Spinner size="h-8 w-8"/></div>
      ) : coupons.length === 0 && !error ? (
        <p className="text-gray-500 bg-white p-6 rounded shadow">Chưa có mã giảm giá nào.</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá trị</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đơn tối thiểu</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hết hạn</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coupons.map(coupon => (
                <tr key={coupon._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-bold text-emerald-700 flex items-center gap-1.5"><Ticket size={16} /> {coupon.code}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}%` // VD: 10%
                      : formatCurrency(coupon.discountValue) // VD: 100.000 ₫
                    }
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatCurrency(coupon.minPurchase)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(coupon.expiryDate)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDeleteCoupon(coupon._id)}
                      disabled={loadingDelete === coupon._id}
                      className="text-red-600 hover:text-red-800 p-1 disabled:opacity-30"
                      title="Xóa"
                    >
                      {loadingDelete === coupon._id ? <Spinner size="h-4 w-4" color="text-red-500"/> : <Trash2 size={16} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Component Input 
const Input = ({ label, name, type = 'text', value, onChange, required = false, placeholder = '', min }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type} id={name} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} min={min}
      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
      style={type === 'date' ? { textTransform: 'uppercase' } : {}}
    />
  </div>
);
// Component Select 
const Select = ({ label, name, value, onChange, children }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      id={name} name={name} value={value} onChange={onChange}
      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
    >
      {children}
    </select>
  </div>
);