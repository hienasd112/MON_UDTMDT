import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Clock, Package, AlertCircle } from 'lucide-react';

// --- Helper định dạng ngày giờ ---
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch (e) { return 'Invalid Date'; }
};

// --- Helper định dạng tiền ---
const formatCurrency = (amount) => amount.toLocaleString('vi-VN') + ' ₫';

// --- Helper lấy trạng thái đơn hàng (cho user) ---
const getUserOrderStatus = (order) => {
  if (order.isDelivered) {
    return { text: "Đã giao hàng", color: "text-green-700 bg-green-100", icon: <CheckCircle size={14} /> };
  }
  if (order.isPaid || order.paymentMethod === 'cod') { // COD coi như "Đang xử lý" nếu chưa giao
    return { text: "Đang xử lý", color: "text-blue-700 bg-blue-100", icon: <Package size={14} /> };
  }
  // Chưa thanh toán (và không phải COD)
  return { text: "Chờ thanh toán", color: "text-yellow-700 bg-yellow-100", icon: <Clock size={14} /> };
};

// --- Component Spinner ---
const Spinner = () => (
  <svg className="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// --- Component Chính ---
export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        setLoading(true);
        setError('');
        // Gọi API lấy đơn hàng của user đang đăng nhập
        const { data } = await axios.get('/api/orders/myorders');
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          throw new Error('Dữ liệu trả về không hợp lệ');
        }
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'Lỗi không xác định.';
        setError(`Không thể tải lịch sử đơn hàng: ${message}`);
        console.error("Fetch My Orders Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, []); // Chỉ chạy 1 lần

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Lịch sử đơn hàng</h1>

      {/* Thông báo lỗi */}
      {error && (
        <div className="mb-6 text-sm text-red-700 bg-red-100 p-4 rounded-lg border border-red-300 flex items-center gap-2">
          <AlertCircle size={18} /><span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="text-center py-10 flex flex-col items-center text-gray-600">
          <Spinner />
          <p className="mt-2">Đang tải đơn hàng của bạn...</p>
        </div>
      ) : /* Danh sách rỗng */
      orders.length === 0 && !error ? (
        <div className="text-center py-10 text-gray-500 bg-white shadow rounded-lg p-6">
          Bạn chưa có đơn hàng nào. <Link to="/" className="text-emerald-600 hover:underline">Bắt đầu mua sắm ngay!</Link>
        </div>
      ) : /* Hiển thị danh sách */
      !error && (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = getUserOrderStatus(order);
            return (
              <div key={order._id} className="bg-white p-5 rounded-lg shadow border border-gray-200 hover:shadow-md transition">
                <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-3 mb-3">
                  <div>
                    <span className="font-semibold text-gray-800">Mã đơn: </span>
                    <span className="font-mono text-sm text-gray-600">#{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Ngày đặt: {formatDateTime(order.createdAt)}
                  </div>
                </div>

                {/* Danh sách sản phẩm thu gọn */}
                <div className="space-y-2 mb-3 max-h-32 overflow-y-auto text-sm pr-2">
                   {order.orderItems.map((item) => (
                      <div key={item.product} className="flex items-center gap-2 text-gray-600">
                         <img src={item.image.startsWith('http') ? item.image : `/${item.image.replace(/\\/g, '/')}`} alt={item.name} className="w-8 h-8 object-contain rounded border flex-shrink-0"/>
                         <span className="truncate flex-grow">{item.name} (x{item.qty})</span>
                         <span className="font-medium whitespace-nowrap">{formatCurrency(item.price * item.qty)}</span>
                      </div>
                   ))}
                </div>

                {/* Tổng tiền và Trạng thái */}
                <div className="flex flex-wrap justify-between items-center gap-3 pt-3 border-t">
                   <div className="text-gray-800">
                      Tổng cộng: <span className="font-bold text-emerald-700 text-lg">{formatCurrency(order.totalPrice)}</span>
                   </div>
                   <span className={`inline-flex items-center gap-1.5 ${statusInfo.color} px-3 py-1 rounded-full text-xs font-semibold`}>
                      {statusInfo.icon} {statusInfo.text}
                   </span>
                   {/* (Thêm nút "Xem chi tiết" nếu muốn) */}
                   {/* <Link to={`/order/${order._id}`} className="...">Xem chi tiết</Link> */}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}