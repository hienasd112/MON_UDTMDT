import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { CreditCard, Smartphone, Banknote, ArrowLeft, AlertCircle, ShieldAlert, Tag, CheckCircle } from 'lucide-react';

// --- Component Spinner ---
const SpinnerIcon = ({ color = 'text-white' }) => (
  <svg className={`animate-spin h-5 w-5 ${color}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// --- Component Chính ---
export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State cho form
  const [shippingInfo, setShippingInfo] = useState({ fullName: '', phone: '', address: '' });
  const [selectedPayment, setSelectedPayment] = useState('');
  const [processing, setProcessing] = useState(false); // Loading Đặt hàng

  // State cho lỗi
  const [error, setError] = useState(''); // Lỗi chung
  const [formErrors, setFormErrors] = useState({ fullName: '', phone: '', address: '' });

  // State cho Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  
  // useEffect (ĐÚNG)
  useEffect(() => {
     if(user) {
        setShippingInfo(prev => ({ 
            fullName: user.fullName || prev.fullName || '', 
            phone: user.phone || prev.phone || '', 
            address: user.address || prev.address || '',
        }));
     }
  }, [user]);

  // --- TÍNH TOÁN ---
  const shippingCost = cartTotal > 1000000 ? 0 : 30000;
  const taxAmount = 0;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = cartTotal + shippingCost + taxAmount - discountAmount;

  // Xử lý thay đổi input
    const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
    setError('');
  };
  
  // Kiểm tra form (validation)
  const validateForm = () => {
    let isValid = true;
    const errors = { fullName: '', phone: '', address: '' };
    if (shippingInfo.fullName.trim().length < 2) { errors.fullName = "Họ tên không hợp lệ."; isValid = false; }
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(shippingInfo.phone)) { errors.phone = "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)."; isValid = false; }
    if (shippingInfo.address.trim().length < 10) { errors.address = "Địa chỉ phải có ít nhất 10 ký tự."; isValid = false; }
    setFormErrors(errors);
    return isValid;
  };

  // --- XỬ LÝ ÁP DỤNG MÃ ---
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) { setCouponError('Vui lòng nhập mã'); return; }
    setCouponLoading(true); setCouponError(''); setError('');
    try {
      const { data } = await axios.post('/api/coupons/validate', {
        code: couponCode, cartTotal: cartTotal,
      });
      setAppliedCoupon(data);
      setCouponCode('');
    } catch (apiError) {
      setCouponError(apiError.response?.data?.message || "Lỗi khi áp dụng mã");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };
  
  // --- HÀM HỦY MÃ ---
  const handleRemoveCoupon = () => {
      setAppliedCoupon(null);
      setCouponError('');
  }

  // --- XỬ LÝ ĐẶT HÀNG (ĐÃ CẬP NHẬT VNPAY) ---
  const handlePayment = async () => {
    // 1. Kiểm tra validation
    if (!validateForm()) {
      setError('Vui lòng kiểm tra lại thông tin giao hàng.');
      return;
    }
    if (!selectedPayment) {
      setError('Vui lòng chọn phương thức thanh toán.');
      return;
    }
    
    setError('');
    setProcessing(true); // Bắt đầu loading

    // 2. Tạo đối tượng đơn hàng
    const orderData = {
      orderItems: cartItems.map(i => ({ product: i._id, name: i.name, qty: i.quantity, price: i.price, image: i.images?.[0] || '' })),
      shippingAddress: shippingInfo,
      paymentMethod: selectedPayment,
      itemsPrice: cartTotal,
      taxPrice: taxAmount,
      shippingPrice: shippingCost,
      discountPrice: discountAmount, 
      couponCode: appliedCoupon ? appliedCoupon.code : null, 
      totalPrice: finalTotal, 
    };

    try {
      // 3. LUÔN LUÔN tạo đơn hàng trong DB trước
      const { data: createdOrder } = await axios.post('/api/orders', orderData);
      console.log("Đã tạo đơn hàng (chưa TT):", createdOrder._id);

      // 4. Xử lý tùy theo phương thức thanh toán
      if (selectedPayment === 'cod') {
        // --- Thanh toán COD ---
        clearCart();
        setProcessing(false); // Dừng loading
        navigate(`/order-success`); // Chuyển đến trang thành công
      
      } else if (selectedPayment === 'vnpay') {
        // --- Thanh toán VNPAY ---
        console.log("Đang yêu cầu link VNPAY cho đơn:", createdOrder._id);
        
        // Gọi API backend để lấy URL VNPAY
        const { data: paymentData } = await axios.post('/api/payment/create-vnpay-url', {
           orderId: createdOrder._id,
           amount: createdOrder.totalPrice, // Lấy tổng tiền TỪ đơn hàng
           language: 'vn',
        });

        // Backend trả về paymentUrl
        if (paymentData && paymentData.paymentUrl) {
           clearCart(); // Xóa giỏ hàng
           // Chuyển hướng người dùng sang cổng VNPAY
           window.location.href = paymentData.paymentUrl;
        } else {
           throw new Error("Không nhận được URL thanh toán VNPAY");
        }
      }
      // (Thêm 'else if (selectedPayment === 'momo')' ở đây sau này)

    } catch (apiError) {
      console.error("Lỗi khi xử lý đặt hàng:", apiError);
      setError(apiError.response?.data?.message || "Lỗi khi tạo đơn hàng. Vui lòng thử lại.");
      setProcessing(false); // Dừng loading nếu lỗi
    }
  };


  // --- RENDER (GIAO DIỆN) ---
  // (Kiểm tra giỏ hàng rỗng)
  if (cartItems.length === 0 && !processing) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl text-gray-600 mb-4">Giỏ hàng của bạn trống.</p>
        <Link to="/" className="text-emerald-600 hover:underline">Quay lại mua sắm</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <Link to="/cart" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition"> <ArrowLeft size={16} /> Quay lại giỏ hàng </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Thanh toán</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* --- Bên trái: Thông tin & Thanh toán --- */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Form Địa chỉ giao hàng */}
             <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Thông tin giao hàng</h2>
                {error && ( <div className="mb-4 text-sm text-red-700 bg-red-100 p-3 rounded flex items-center gap-2"> <AlertCircle size={16} /> <span>{error}</span> </div> )}
                <div className="space-y-4 mt-3">
                  <Input label="Họ và tên" name="fullName" value={shippingInfo.fullName} onChange={handleShippingChange} required error={formErrors.fullName} />
                  <Input label="Số điện thoại" name="phone" value={shippingInfo.phone} onChange={handleShippingChange} required placeholder="VD: 0912345678" error={formErrors.phone} />
                  <Input label="Địa chỉ" name="address" value={shippingInfo.address} onChange={handleShippingChange} required placeholder="Số nhà, tên đường, phường/xã, quận/huyện..." error={formErrors.address} />
                </div>
             </div>
             
            {/* Chọn phương thức thanh toán */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Chọn phương thức thanh toán</h2>
              <div className="space-y-3 mt-3">
                 <PaymentOption value="vnpay" selected={selectedPayment} onChange={setSelectedPayment} icon={<CreditCard size={20} className="text-blue-600"/>}> Thanh toán qua VNPAY-QR </PaymentOption>
                 {/* <PaymentOption value="momo" selected={selectedPayment} onChange={setSelectedPayment} icon={<Smartphone size={20} className="text-pink-600"/>}> Thanh toán qua Ví MoMo (Mô phỏng) </PaymentOption> */}
                 <PaymentOption value="cod" selected={selectedPayment} onChange={setSelectedPayment} icon={<Banknote size={20} className="text-green-600"/>}> Thanh toán khi nhận hàng (COD) </PaymentOption>
              </div>
            </div>
          </div>

          {/* --- Bên phải: Tóm tắt đơn hàng --- */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow sticky top-24">
              <h2 className="text-xl font-semibold mb-4 border-b pb-3 text-gray-700">Tóm tắt đơn hàng</h2>
              
              {/* Ô NHẬP MÃ GIẢM GIÁ */}
              <div className="mb-4">
                {!appliedCoupon ? (
                  <>
                    <label htmlFor="couponCode" className="block text-sm font-medium text-gray-700 mb-1">Mã giảm giá</label>
                    <div className="flex">
                      <input
                        type="text" id="couponCode" value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="NHẬP MÃ"
                        className={`block w-full rounded-l-md border-gray-300 shadow-sm sm:text-sm ${couponError ? 'border-red-500 ring-red-500' : 'focus:border-emerald-500 focus:ring-emerald-500'}`}
                        disabled={couponLoading}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        className="flex-shrink-0 rounded-r-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                      >
                        {couponLoading ? <SpinnerIcon color="text-white" /> : "Áp dụng"}
                      </button>
                    </div>
                    {couponError && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><ShieldAlert size={14} /> {couponError}</p>}
                  </>
                ) : (
                  <div className="text-sm text-green-700 bg-green-100 p-3 rounded-lg border border-green-300">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold flex items-center gap-1.5">
                        <CheckCircle size={16} /> Đã áp dụng mã: {appliedCoupon.code}
                      </span>
                      <button onClick={handleRemoveCoupon} className="font-bold text-red-500 hover:text-red-700" title="Hủy mã">&times;</button>
                    </div>
                    <p className="mt-1">Bạn được giảm: {appliedCoupon.discountAmount.toLocaleString('vi-VN')} ₫</p>
                  </div>
                )}
              </div>
              
              {/* TÍNH TOÁN TIỀN */}
              <div className="space-y-2 mb-4 text-sm border-t pt-4">
                <div className="flex justify-between text-gray-600"><span>Tạm tính</span> <span>{cartTotal.toLocaleString('vi-VN')} ₫</span></div>
                <div className="flex justify-between text-gray-600"><span>Phí vận chuyển</span> <span className={shippingCost > 0 ? "" : "text-green-600"}>{shippingCost > 0 ? shippingCost.toLocaleString('vi-VN') + ' ₫' : 'Miễn phí'}</span></div>
                {discountAmount > 0 && (
                   <div className="flex justify-between text-emerald-600 font-medium">
                     <span>Giảm giá</span>
                     <span>- {discountAmount.toLocaleString('vi-VN')} ₫</span>
                   </div>
                )}
              </div>
              
              {/* Tổng cộng */}
              <div className="border-t pt-4 flex justify-between text-lg font-bold text-gray-800">
                <span>Tổng cộng</span>
                <span className="text-emerald-700">{finalTotal.toLocaleString('vi-VN')} ₫</span>
              </div>
              
              {/* Nút Đặt hàng */}
              <button
                onClick={handlePayment}
                disabled={processing || cartItems.length === 0}
                className={`mt-6 w-full rounded-lg px-6 py-3 font-bold text-white shadow-md transition ${ processing ? 'bg-gray-400 cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700' } ${ (cartItems.length === 0) && !processing ? 'bg-gray-300 cursor-not-allowed' : ''}`}
              >
                {processing ? ( <div className="flex items-center justify-center gap-2"> <SpinnerIcon /> Đang xử lý... </div> ) : ( `Đặt hàng (${finalTotal.toLocaleString('vi-VN')} ₫)` )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Component con (PaymentOption, Input - giữ nguyên) ---
const PaymentOption = ({ value, selected, onChange, icon, children }) => (
     <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${selected === value ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/50' : 'border-gray-300 hover:border-gray-400 bg-white'}`}>
        <input type="radio" name="paymentMethod" value={value} checked={selected === value} onChange={() => onChange(value)} className="mr-3 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"/>
        {icon && React.cloneElement(icon, { className: "mr-2 flex-shrink-0" })}
        <span className="font-medium text-sm flex-grow">{children}</span>
     </label>
);
const Input = ({ label, name, type = 'text', value, onChange, required = false, placeholder = '', error = '' }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1"> {label} {required && <span className="text-red-500">*</span>} </label>
    <input
      type={type} id={name} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder}
      className={`block w-full rounded-md shadow-sm sm:text-sm ${ error ? 'border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500' }`}
      aria-invalid={!!error} aria-describedby={error ? `${name}-error` : undefined}
    />
    {error && ( <p id={`${name}-error`} className="mt-1.5 text-xs text-red-600 flex items-center gap-1"> <ShieldAlert size={14} /> {error} </p> )}
  </div>
);