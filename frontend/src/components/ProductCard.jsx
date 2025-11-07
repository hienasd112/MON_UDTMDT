import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../hooks/useCart';

// --- Hàm lấy URL ảnh (Đảm bảo giống với hàm trong AdminProductList) ---
const getImageUrl = (imagePath) => {
  const fallbackImage = "https://dummyimage.com/400x400/cccccc/ffffff.png&text=N/A";
  if (!imagePath || imagePath.trim() === "") return fallbackImage;
  if (imagePath.startsWith("http")) return imagePath;
  let fixedPath = imagePath.replace(/\\/g, '/'); 
  if (!fixedPath.startsWith('/')) fixedPath = '/' + fixedPath; 
  // Không cần thêm proxy ở đây nếu server backend và frontend chạy cùng domain/port khi build
  return `${fixedPath}`;
};

// --- Component Chính ---
export default function ProductCard({ product }) {
  const { addToCart } = useCart(); // Lấy hàm thêm vào giỏ từ context

  // Trả về null nếu không có dữ liệu product (phòng lỗi)
  if (!product) return null;

  // Lấy các thông tin cần thiết từ product object
  const { _id, name, images, price, oldPrice } = product;
  // Lấy ảnh đầu tiên, hoặc ảnh N/A nếu không có
  const imageUrl = getImageUrl(images && images.length > 0 ? images[0] : null);

  // ---  TÍNH TOÁN PHẦN TRĂM GIẢM GIÁ ---
  let discountPercent = 0;
  // Chỉ tính khi có giá gốc (oldPrice > 0) và giá gốc lớn hơn giá bán
  if (oldPrice && oldPrice > 0 && oldPrice > price) {
    discountPercent = Math.round(((oldPrice - price) / oldPrice) * 100);
  }
  // ----------------------------------------

  // Hàm xử lý khi nhấn nút "Thêm vào giỏ"
  const handleAddToCart = (e) => {
    e.preventDefault(); // Ngăn Link (thẻ cha) điều hướng khi click nút
    e.stopPropagation(); // Ngăn sự kiện click nổi bọt lên thẻ Link
    addToCart(product, 1); // Thêm 1 sản phẩm vào giỏ
  };

  return (
    // Thẻ bao bọc toàn bộ card sản phẩm
    <div className="group relative flex h-full w-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2">
      {/* Link bao bọc ảnh và tên, click vào sẽ đến trang chi tiết */}
      <Link to={`/product/${_id}`} className="flex flex-col flex-grow">

        {/* ---  TAG HIỂN THỊ % GIẢM GIÁ --- */}
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 z-10 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-md">
            -{discountPercent}%
          </div>
        )}
        {/* ------------------------------------- */}

        {/* Khu vực hiển thị ảnh */}
        <div className="aspect-square w-full overflow-hidden bg-gray-50">
          <img
            src={imageUrl}
            alt={name} // Alt text mô tả ảnh
            className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105" // Hiệu ứng zoom nhẹ khi hover
            loading="lazy" // Tải ảnh lười (chỉ tải khi gần viewport)
          />
        </div>

        {/* Khu vực hiển thị tên và giá */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Tên sản phẩm */}
          <h3 className="text-sm font-medium text-gray-700 h-10 overflow-hidden mb-2 group-hover:text-emerald-700 transition">
            {/* Giới hạn 2 dòng chữ */}
            <span className="line-clamp-2">{name}</span>
          </h3>

          {/* --- (CẬP NHẬT) HIỂN THỊ GIÁ --- */}
          <div className="mt-auto flex items-baseline gap-2"> {/* Đẩy giá xuống cuối card */}
            {discountPercent > 0 ? (
              // Nếu có giảm giá: hiển thị giá mới (đỏ) và giá cũ (gạch ngang)
              <>
                <span className="text-lg font-bold text-red-600">
                  {price.toLocaleString('vi-VN')} ₫
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {oldPrice.toLocaleString('vi-VN')} ₫
                </span>
              </>
            ) : (
              // Nếu không giảm giá: chỉ hiển thị giá bán
              <span className="text-lg font-bold text-gray-900">
                {price.toLocaleString('vi-VN')} ₫
              </span>
            )}
          </div>
          {/* ------------------------------- */}

        </div>
      </Link>

      {/* --- Nút "Thêm vào giỏ" (Xuất hiện khi hover) --- */}
      {/* Chỉ hiển thị nếu còn hàng */}
      {product.stock > 0 && (
        <div className="absolute bottom-4 right-4 z-10 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
              onClick={handleAddToCart}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              title="Thêm vào giỏ hàng"
              aria-label="Thêm vào giỏ hàng"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      )}
      {/* (Có thể thêm tag "Hết hàng" nếu product.stock === 0) */}

    </div>
  );
}