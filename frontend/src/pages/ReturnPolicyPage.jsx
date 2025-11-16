import React from 'react';

export default function ReturnPolicyPage() {
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-800">Chính sách đổi trả</h1>
          
          <h2>1. Thời gian đổi trả</h2>
          <p>WatchStore hỗ trợ đổi trả sản phẩm miễn phí trong vòng **7 ngày** kể từ ngày quý khách nhận được hàng.</p>

          <h2>2. Điều kiện đổi trả</h2>
          <p>Chúng tôi chỉ chấp nhận đổi trả khi sản phẩm đáp ứng đầy đủ các điều kiện sau:</p>
          <ul>
            <li>Sản phẩm bị lỗi kỹ thuật từ nhà sản xuất.</li>
            <li>Sản phẩm giao không đúng mẫu mã, màu sắc so với đơn hàng đã đặt.</li>
            <li>Sản phẩm phải còn mới 100%, chưa qua sử dụng.</li>
            <li>Sản phẩm phải còn đầy đủ tem, mác, hộp, sách hướng dẫn, thẻ bảo hành và hóa đơn mua hàng.</li>
          </ul>

          <h2>3. Trường hợp không áp dụng đổi trả</h2>
          <ul>
            <li>Sản phẩm đã qua sử dụng, bị trầy xước, móp méo.</li>
            <li>Sản phẩm bị hỏng hóc do lỗi của người dùng.</li>
            <li>Sản phẩm không nằm trong các điều kiện nêu ở Mục 2.</li>
          </ul>

          <h2>4. Quy trình đổi trả</h2>
          <p>Vui lòng liên hệ hotline 0364.389.055 hoặc qua trang "Liên hệ" để được hướng dẫn chi tiết về quy trình gửi trả hàng.</p>
        </div>
      </div>
    </div>
  );
}