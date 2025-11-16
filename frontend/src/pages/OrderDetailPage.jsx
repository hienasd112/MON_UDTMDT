import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom'; 
import toast from 'react-hot-toast'; 
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { CheckCircle, Clock, Package, AlertCircle, ArrowLeft, User, MapPin, Phone, Banknote, Mail } from 'lucide-react';

// --- Helper định dạng ngày giờ ---
const formatDateTime = (dateString) => {
  if (!dateString) return 'Chưa cập nhật';
  try {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch (e) { return 'Ngày không hợp lệ'; }
};

// --- Helper định dạng tiền ---
const formatCurrency = (amount) => {
  if (typeof amount !== 'number') {
    return '0 ₫'; // Trả về giá trị mặc định nếu không phải là số
  }
  return amount.toLocaleString('vi-VN') + ' ₫';
};

// --- Component Spinner ---
const Spinner = () => (
  <svg className="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// --- Component Chính ---
export default function OrderDetailPage() {
  const { id: orderId } = useParams();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams(); 
  const navigate = useNavigate(); 

  // ---  useEffect ĐỂ HIỂN THỊ THÔNG BÁO ---
  useEffect(() => {
    // Lấy trạng thái thanh toán từ URL
    const paymentStatus = searchParams.get('payment_status');

    if (paymentStatus === 'success') {
      toast.success('Thanh toán VNPAY thành công!');
      navigate('.', { replace: true }); 
    } 
    else if (paymentStatus === 'success_cod') { // Cho COD (nếu bạn làm Bước 5)
      toast.success('Đặt hàng COD thành công! Bạn sẽ thanh toán khi nhận hàng.');
      navigate('.', { replace: true });
    }
    else if (paymentStatus === 'fail') {
      toast.error('Thanh toán thất bại hoặc đã bị hủy.');
      navigate('.', { replace: true });
    }
  }, [searchParams, navigate]); // Chạy khi URL thay đổi

  // --- useEffect ĐỂ LẤY CHI TIẾT ĐƠN HÀNG ---
  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await axios.get(`/api/orders/${orderId}`);
        setOrder(data);
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'Lỗi không xác định.';
        setError(`Không thể tải chi tiết đơn hàng: ${message}`);
        console.error("Fetch Order Detail Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]); 

  // --- (PHẦN RENDER) ---
  if (loading) {
    return <div className="text-center py-20"><Spinner /></div>;
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12 text-center text-red-600 bg-red-50 rounded-lg shadow">
        <AlertCircle size={40} className="mx-auto mb-4" />
        <p className="font-semibold mb-2">Đã xảy ra lỗi</p>
        <p>{error}</p>
        <Link 
           to={user?.role === 'admin' ? '/admin/orders' : '/my-orders'} 
           className="mt-6 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
           <ArrowLeft size={16} /> Quay lại danh sách đơn hàng
        </Link>
      </div>
    );
  }

  if (!order) {
    return <div className="text-center py-20 text-gray-600">Không tìm thấy đơn hàng.</div>;
  }

  const { shippingAddress, paymentMethod, orderItems, itemsPrice, shippingPrice, taxPrice, discountPrice, totalPrice, isPaid, paidAt, isDelivered, deliveredAt } = order;

  const paymentStatus = isPaid 
    ? { text: `Đã thanh toán (${formatDateTime(paidAt)})`, color: "text-green-700 bg-green-100", icon: <CheckCircle size={16}/> }
    : paymentMethod === 'cod' 
      ? { text: 'Thanh toán khi nhận hàng', color: "text-gray-700 bg-gray-100", icon: <Banknote size={16}/>}
      : { text: 'Chờ thanh toán', color: "text-yellow-700 bg-yellow-100", icon: <Clock size={16}/> };

  const deliveryStatus = isDelivered
    ? { text: `Đã giao hàng (${formatDateTime(deliveredAt)})`, color: "text-green-700 bg-green-100", icon: <CheckCircle size={16}/> }
    : { text: 'Chưa giao hàng', color: "text-blue-700 bg-blue-100", icon: <Package size={16}/> };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
       <Link 
         to={user?.role === 'admin' ? '/admin/orders' : '/my-orders'} 
         className="mb-6 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition"
       > 
         <ArrowLeft size={16} /> Quay lại danh sách đơn hàng 
       </Link>
       
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
        Chi tiết đơn hàng
      </h1>
      <p className="text-sm text-gray-500 mb-8 font-mono">
        Mã đơn: #{order._id}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cột Trái: Thông tin giao hàng & Trạng thái */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Thông tin người nhận</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-start gap-2"><User size={16} className="mt-0.5 flex-shrink-0 text-gray-400"/> <span>{shippingAddress.fullName}</span></p>
              {order.user?.email && <p className="flex items-start gap-2"><Mail size={16} className="mt-0.5 flex-shrink-0 text-gray-400"/> <span>{order.user.email}</span></p>}
              <p className="flex items-start gap-2"><Phone size={16} className="mt-0.5 flex-shrink-0 text-gray-400"/> <span>{shippingAddress.phone}</span></p>
              <p className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 flex-shrink-0 text-gray-400"/> <span>{shippingAddress.address}</span></p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Trạng thái đơn hàng</h2>
            <div className="space-y-3">
               <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 ${paymentStatus.color} px-3 py-1 rounded-full text-xs font-semibold`}>
                      {paymentStatus.icon} {paymentStatus.text}
                   </span>
               </div>
               <div className={`inline-flex items-center gap-1.5 ${deliveryStatus.color} px-3 py-1 rounded-full text-xs font-semibold`}>
                  {deliveryStatus.icon} {deliveryStatus.text}
               </div>
            </div>
          </div>
        </div>

        {/* Cột Phải: Sản phẩm & Tổng tiền */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-3">Sản phẩm trong đơn hàng</h2>
          
          <div className="divide-y divide-gray-100 mb-6">
            {orderItems.map((item) => (
              <div key={item.product} className="flex items-center gap-4 py-4">
                 <Link to={`/product/${item.product}`} className="flex-shrink-0">
                    <img 
                       src={item.image?.startsWith('http') ? item.image : `/${item.image?.replace(/\\/g, '/')}`} 
                       alt={item.name} 
                       className="w-16 h-16 object-contain rounded border border-gray-200 bg-gray-50 p-1"
                    />
                 </Link>
                 <div className="flex-grow">
                    <Link to={`/product/${item.product}`} className="text-sm font-medium text-gray-800 hover:text-emerald-700 line-clamp-2">
                       {item.name}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">Số lượng: {item.qty}</p>
                 </div>
                 <div className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                    {formatCurrency(item.price * item.qty)}
                 </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t pt-4 text-sm">
             <div className="flex justify-between text-gray-600"><span>Tạm tính</span> <span>{formatCurrency(itemsPrice)}</span></div>
             <div className="flex justify-between text-gray-600"><span>Phí vận chuyển</span> <span>{formatCurrency(shippingPrice)}</span></div>
             {discountPrice > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Giảm giá ({order.couponCode})</span> 
                  <span>- {formatCurrency(discountPrice)}</span>
                </div>
             )}
             
             <div className="border-t pt-3 mt-3 flex justify-between text-lg font-bold text-gray-800">
               <span>Tổng cộng</span>
               <span className="text-emerald-700">{formatCurrency(totalPrice)}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}