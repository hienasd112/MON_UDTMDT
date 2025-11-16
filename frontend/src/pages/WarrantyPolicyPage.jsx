import React from 'react';

export default function WarrantyPolicyPage() {
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-800">Chính sách bảo hành</h1>
          
          <h2>1. Thời gian bảo hành</h2>
          <p>Tất cả sản phẩm đồng hồ bán ra tại WatchStore đều được bảo hành chính hãng từ 1 đến 5 năm (tùy theo quy định của từng thương hiệu). Ngoài ra, chúng tôi tặng thêm gói bảo hành độc quyền tại cửa hàng, nâng tổng thời gian bảo hành lên đến 5 năm.</p>

          <h2>2. Điều kiện bảo hành (Miễn phí)</h2>
          <ul>
            <li>Sản phẩm còn trong thời gian bảo hành.</li>
            <li>Lỗi kỹ thuật do nhà sản xuất (ví dụ: đồng hồ không chạy, chạy sai giờ, tự động dừng).</li>
            <li>Sản phẩm phải có thẻ bảo hành chính hãng và hóa đơn mua hàng tại WatchStore.</li>
          </ul>

          <h2>3. Trường hợp không bảo hành (Sẽ tính phí sửa chữa)</h2>
          <ul>
            <li>Các lỗi do người dùng gây ra: rơi, vỡ, va đập, trầy xước mặt kính hoặc dây đeo.</li>
            <li>Sản phẩm bị vào nước do sử dụng sai cách (ví dụ: đeo đồng hồ chống nước 3ATM đi bơi).</li>
            <li>Hết thời gian bảo hành.</li>
          </ul>

          <h2>4. Địa điểm bảo hành</h2>
          <p>Quý khách có thể mang sản phẩm đến trực tiếp cửa hàng WatchStore hoặc gửi đến trung tâm bảo hành chính hãng của thương hiệu tại Việt Nam (địa chỉ ghi trên thẻ bảo hành).</p>
        </div>
      </div>
    </div>
  );
}