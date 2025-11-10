import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart"; 
import { Trash2, Plus, Minus } from "lucide-react"; 

// Hàm getImageUrl (cần cho trang này)
const getImageUrl = (imagePath) => {
  if (!imagePath) return "https://dummyimage.com/600x600/cccccc/ffffff.png&text=No+Image";
  if (imagePath.startsWith("http")) return imagePath;
  const base = ""; // Proxy
  return `${base}${imagePath}`;
};

export default function Cart() {
  // Lấy dữ liệu và hàm từ CartContext qua hook useCart
  const { cartItems, cartTotal, cartCount, removeFromCart, updateQuantity, clearCart } = useCart();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-800 md:mb-8 md:text-3xl">Giỏ hàng của bạn ({cartCount} sản phẩm)</h1>

      {/* Trường hợp giỏ hàng trống */}
      {cartItems.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow md:p-12">
          <img src="/empty-cart.svg" alt="Giỏ hàng trống" className="mx-auto mb-6 h-32 w-32 text-gray-400" /> {/* Thêm ảnh minh họa */}
          <p className="mb-6 text-lg text-gray-500">Giỏ hàng của bạn hiện đang trống.</p>
          <Link
            to="/"
            className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        // Trường hợp giỏ hàng có sản phẩm
        <div className="grid grid-cols-1 gap-8 items-start lg:grid-cols-3 lg:gap-12">
          {/* Danh sách sản phẩm trong giỏ */}
          <div className="divide-y divide-gray-200 rounded-lg bg-white shadow lg:col-span-2">
            {cartItems.map((item) => (
              <div key={item._id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-6 md:p-6">
                {/* Ảnh sản phẩm */}
                <Link to={`/product/${item._id}`} className="block w-full flex-shrink-0 sm:w-24">
                   <img
                     src={getImageUrl(item.images && item.images[0])} // Chỉ lấy ảnh đầu tiên
                     alt={item.name}
                     className="aspect-square w-full rounded-lg object-cover sm:h-24 sm:w-24"
                   />
                </Link>

                {/* Thông tin sản phẩm */}
                <div className="flex-1">
                  <Link to={`/product/${item._id}`} className="block text-base font-semibold text-gray-800 hover:text-emerald-700 md:text-lg">
                    {item.name}
                  </Link>
                  <p className="mt-1 font-bold text-emerald-600 md:text-lg">
                    {item.price.toLocaleString("vi-VN")} ₫
                  </p>
                   {/* Hiển thị tổng tiền cho item này */}
                   <p className="mt-1 text-sm text-gray-500">
                     Tổng: {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                   </p>
                </div>

                {/* Điều chỉnh số lượng và xóa */}
                <div className="flex items-center justify-between sm:justify-end sm:gap-4">
                  {/* Quantity Input */}
                   <div className="flex items-center rounded border border-gray-300">
                     <button
                       onClick={() => updateQuantity(item._id, item.quantity - 1)}
                       className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                       disabled={item.quantity <= 1}
                       aria-label="Giảm số lượng"
                     >
                       <Minus size={16} />
                     </button>
                     <input
                       type="number"
                       min="1"
                       // max={item.stock} // Cần lấy stock từ product detail hoặc API nếu muốn giới hạn
                       value={item.quantity}
                       onChange={(e) => updateQuantity(item._id, parseInt(e.target.value))}
                       className="w-12 border-l border-r border-gray-300 py-1 text-center text-sm focus:outline-none"
                       aria-label={`Số lượng cho ${item.name}`}
                     />
                     <button
                       onClick={() => updateQuantity(item._id, item.quantity + 1)}
                       className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                       // disabled={item.quantity >= item.stock}
                       aria-label="Tăng số lượng"
                     >
                       <Plus size={16} />
                     </button>
                   </div>
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="ml-4 text-red-500 transition hover:text-red-700 sm:ml-0"
                    title="Xóa sản phẩm"
                    aria-label={`Xóa ${item.name} khỏi giỏ hàng`}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
             {/* Nút xóa tất cả */}
             <div className="p-4 text-right">
                <button
                   onClick={clearCart}
                   className="text-sm text-gray-500 hover:text-red-600 hover:underline"
                 >
                   Xóa tất cả sản phẩm
                 </button>
             </div>
          </div>

          {/* Tóm tắt đơn hàng */}
          <div className="sticky top-24 rounded-lg bg-white p-6 shadow lg:col-span-1">
            <h2 className="mb-4 border-b pb-4 text-xl font-bold text-gray-800">
              Tóm tắt đơn hàng
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính ({cartCount} sản phẩm)</span>
                <span>{cartTotal.toLocaleString("vi-VN")} ₫</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span className="font-medium text-green-600">Miễn phí</span>
              </div>
              <div className="border-t pt-4 mt-4 flex justify-between text-xl font-bold text-gray-800">
                <span>Tổng cộng</span>
                <span className="text-emerald-700">
                  {cartTotal.toLocaleString("vi-VN")} ₫
                </span>
              </div>
            </div>
            {/* Nút Thanh toán */}
            <Link
              to="/checkout" // Link tới trang thanh toán
              className="mt-6 block w-full rounded-lg bg-emerald-600 py-3 text-center text-lg font-bold text-white shadow transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Tiến hành thanh toán
            </Link>
             <Link
               to="/"
               className="mt-3 block w-full text-center text-sm text-emerald-600 hover:underline"
             >
               Hoặc tiếp tục mua sắm
             </Link>
          </div>
        </div>
      )}
    </div>
  );
}