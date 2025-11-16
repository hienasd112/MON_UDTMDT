import React from 'react';

// Component cho 1 câu hỏi (Q&A Item)
const FaqItem = ({ question, children }) => (
  <details className="border border-gray-200 rounded-lg overflow-hidden">
    <summary className="cursor-pointer bg-gray-50 hover:bg-gray-100 p-4 font-medium text-gray-800 flex justify-between items-center">
      {question}
      <svg className="w-5 h-5 text-gray-500 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </summary>
    <div className="p-4 bg-white text-gray-600 text-sm leading-relaxed">
      {children}
    </div>
  </details>
);

export default function FAQPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
        Câu hỏi thường gặp (FAQ)
      </h1>
      
      <div className="space-y-4">
        <FaqItem question="Mua hàng tại WatchStore có an toàn không?">
          <p>Tuyệt đối an toàn. Chúng tôi cam kết 100% sản phẩm chính hãng. Mọi thông tin giao dịch của bạn đều được bảo mật tuyệt đối.</p>
        </FaqItem>
        
        <FaqItem question="Chính sách bảo hành như thế nào?">
          <p>Tất cả sản phẩm đều được bảo hành quốc tế theo quy định của hãng (thường là 1-2 năm) và bảo hành thêm tại WatchStore. Bạn có thể xem chi tiết tại trang Chính sách bảo hành.</p>
        </FaqItem>

        <FaqItem question="Tôi có thể đổi trả sản phẩm không?">
          <p>Có. Chúng tôi hỗ trợ đổi trả trong vòng 7 ngày nếu sản phẩm có lỗi từ nhà sản xuất hoặc không đúng mẫu mã bạn đặt. Vui lòng giữ sản phẩm còn nguyên tem, mác và hóa đơn.</p>
        </FaqItem>

        <FaqItem question="Thanh toán VNPAY bị lỗi thì phải làm sao?">
          <p>Nếu thanh toán thất bại, đơn hàng của bạn sẽ tự động chuyển về trạng thái "Chờ thanh toán". Bạn có thể vào mục "Đơn hàng của tôi", chọn đơn hàng đó và thử thanh toán lại hoặc chọn phương thức COD (nếu có).</p>
        </FaqItem>
      </div>
    </div>
  );
}