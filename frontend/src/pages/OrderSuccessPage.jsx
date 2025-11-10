import React from 'react';
import { Link, useParams } from 'react-router-dom'; 
import { CheckCircle, Package } from 'lucide-react';

export default function OrderSuccessPage() {
  // const { orderId } = useParams(); // Lấy ID đơn hàng từ URL nếu bạn truyền vào

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-16 bg-gradient-to-b from-emerald-50 to-white">
      <CheckCircle size={80} className="text-emerald-500 mb-6 animate-pulse" />
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Đặt hàng thành công!</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        Cảm ơn bạn đã tin tưởng và mua sắm tại WatchStore. Đơn hàng của bạn đã được ghi nhận và đang được xử lý.
        {/* {orderId && <span className="block mt-2 font-medium">Mã đơn hàng: #{orderId.substring(0, 8)}...</span>} */}
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/" // Quay về trang chủ
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white shadow transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
}