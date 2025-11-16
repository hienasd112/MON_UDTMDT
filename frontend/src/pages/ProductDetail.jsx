import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProductById } from "../services/product";
import { useCart } from "../hooks/useCart";
import { ShieldCheck, Package, RotateCw, CheckCircle, ChevronLeft, AlertCircle } from "lucide-react";

// --- Helper: Lấy URL ảnh ---
const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return "https://dummyimage.com/600x600/cccccc/ffffff.png&text=No+Image";
  }
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  const base = ""; 
  return `${base}${imagePath}`;
};

// --- Helper: Component Thông số ---
const SpecItem = ({ label, value }) => (
  <div className="flex justify-between border-b border-gray-200 py-3 text-sm last:border-b-0">
    <span className="font-medium text-gray-600">{label}:</span>
    <span className="text-right font-semibold text-gray-800">{value || "N/A"}</span>
  </div>
);

// --- Component Chính ---
export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  // States
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [addedMessage, setAddedMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch dữ liệu
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchProductById(id);
        setProduct(data);
        
        if (data.images && data.images.length > 0) {
          setMainImage(data.images[0]);
        } else {
          setMainImage(data.image || ""); // Dùng ảnh chính nếu không có thư viện
        }
      } catch (err) {
        console.error("❌ Lỗi tải chi tiết sản phẩm:", err);
        setProduct(null);
        setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Hàm xử lý
  const handleQuantityChange = (event) => {
    let value = parseInt(event.target.value);
    if (isNaN(value) || value < 1) value = 1;
    
    // --- (1) SỬA LẠI: DÙNG 'stock' ---
    else if (product && value > product.stock) {
      value = product.stock;
    }
    setQuantity(value);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAddedMessage(`${quantity} "${product.name}" đã được thêm vào giỏ hàng!`);
    setTimeout(() => setAddedMessage(''), 3000);
  };

  // --- Logic hiển thị (Loading, Error) ---
  if (loading) { return <div className="text-center py-20 text-gray-600">Đang tải...</div>; }
  if (error) {
     return (
       <div className="text-center py-20 text-red-600 bg-red-50">
         <AlertCircle size={40} className="mx-auto mb-4" />
         <p className="mb-4 text-xl font-medium">Đã xảy ra lỗi</p>
         <p className="mb-6 text-gray-700">{error}</p>
         <Link to="/" className="text-emerald-600 hover:underline inline-flex items-center gap-1">
           <ChevronLeft size={16} /> Quay lại trang chủ
         </Link>
       </div>
     );
  }
  if (!product) {
    return (
      <div className="text-center py-20 text-gray-600">
        <p className="mb-4 text-xl">Rất tiếc, không tìm thấy sản phẩm này.</p>
        <Link to="/" className="text-emerald-600 hover:underline inline-flex items-center gap-1">
          <ChevronLeft size={16} /> Quay lại trang chủ
        </Link>
      </div>
    );
  }

  // --- Render (Hiển thị chi tiết sản phẩm) ---
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8 md:py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 lg:gap-16 items-start">
          
          {/* ----- BÊN TRÁI: THƯ VIỆN ẢNH ----- */}
            <div className="sticky top-24">
              <div className="aspect-square w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm mb-4 bg-gray-50">
               <img src={getImageUrl(mainImage)} alt={`Ảnh chính ${product.name}`} className="h-full w-full object-contain mix-blend-multiply"/>
              </div>
              <div className="flex space-x-2 md:space-x-3 overflow-x-auto pb-2">
               {product.images?.slice(0, 5).map((img, index) => (
                 <button key={index} onClick={() => setMainImage(img)} className={`block h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 bg-gray-50 transition md:h-20 md:w-20 ${ mainImage === img ? "border-emerald-600 ring-1" : "border-gray-200 hover:border-emerald-400" }`}>
                   <img src={getImageUrl(img)} alt={`Ảnh ${index + 1}`} className="h-full w-full object-contain mix-blend-multiply"/>
                 </button>
               ))}
              </div>
            </div>

            {/* ----- BÊN PHẢI: THÔNG TIN & MUA HÀNG  ----- */}
            <div>
              {/* Thông tin cơ bản */}
              <span className="mb-1 block text-sm font-semibold uppercase tracking-wide text-emerald-700"> {product.category?.name || "Thương hiệu"} </span>
              <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">{product.name}</h1>
              <p className="mb-5 text-3xl font-bold text-red-600 md:text-4xl"> {product.price.toLocaleString("vi-VN")} ₫ </p>
              
              {/* --- (2) SỬA LẠI: DÙNG 'stock' --- */}
              <div className="mb-6 flex items-center gap-2">
                <CheckCircle size={20} className={product.stock > 0 ? "text-green-600" : "text-gray-400"} />
                <span className={`font-semibold ${product.stock > 0 ? "text-green-600" : "text-gray-500"}`}>
                  {product.stock > 0 ? `Còn hàng (${product.stock})` : "Hết hàng"}
                </span>
              </div>

              {/* --- (3) SỬA LẠI: DÙNG 'stock' --- */}
              <div className="mb-6 flex items-center gap-4">
                <label htmlFor="quantity" className="font-medium text-gray-700">Số lượng:</label>
                <input 
                  id="quantity" 
                  type="number" 
                  min="1" 
                  max={product.stock > 0 ? product.stock : 1} // <-- (4) SỬA LẠI
                  value={quantity} 
                  onChange={handleQuantityChange} 
                  disabled={product.stock === 0} // <-- (5) SỬA LẠI
                  className="w-20 rounded-md border border-gray-300 px-3 py-2 text-center focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
                <button 
                  onClick={handleAddToCart} 
                  className="flex-1 rounded-lg bg-emerald-600 px-6 py-3 text-lg font-bold text-white shadow transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400" 
                  disabled={product.stock === 0} // <-- (6) SỬA LẠI
                >
                  {product.stock > 0 ? "Thêm vào giỏ hàng" : "Đã hết hàng"}
                </button>
              </div>

              {/* (Giữ nguyên các phần còn lại) */}
              {addedMessage && (
                <div className="mb-6 rounded-md bg-green-100 p-3 text-center text-sm text-green-700 border border-green-200">
                  {addedMessage} <Link to="/cart" className="font-bold underline hover:text-green-800 ml-1">Xem giỏ hàng</Link>
                </div>
              )}
              
              <div className="mb-6 grid grid-cols-2 gap-4 rounded border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 md:grid-cols-3">
                <div className="flex items-center gap-2"><ShieldCheck size={20} className="text-emerald-600 flex-shrink-0"/><span>Bảo hành chính hãng</span></div>
                <div className="flex items-center gap-2"><Package size={20} className="text-emerald-600 flex-shrink-0"/><span>Miễn phí vận chuyển</span></div>
                <div className="flex items-center gap-2"><RotateCw size={20} className="text-emerald-600 flex-shrink-0"/><span>Đổi trả dễ dàng</span></div>
              </div>

              <div className="mb-6">
                <h4 className="mb-3 text-base font-semibold text-gray-800 md:text-lg">Thông số kỹ thuật</h4>
                <div className="space-y-1 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <SpecItem label="Thương hiệu" value={product.category?.name} />
                  <SpecItem label="Mã SKU" value={product.sku} />
                  <SpecItem label="Bộ máy" value={product.movement} />
                  <SpecItem label="Chất liệu vỏ" value={product.caseMaterial} />
                  <SpecItem label="Chất liệu dây" value={product.strapMaterial} />
                  <SpecItem label="Chống nước" value={product.waterResistance} />
                  <SpecItem label="Kích thước mặt" value={product.caseSize ? `${product.caseSize} mm` : 'N/A'} />
                  <SpecItem label="Mặt kính" value={product.glassType} />
                </div>
              </div>
            </div>
        </div>

        {/* (Giữ nguyên Mô tả) */}
        <div className="mt-12 md:mt-16 lg:mt-20">
            <div className="border-b border-gray-200">
              <h3 className="mb-[-1px] inline-block border-b-2 border-emerald-700 pb-3 text-lg font-bold text-emerald-700 md:text-xl">
                Mô tả sản phẩm
              </h3>
            </div>
            <div className="mt-6">
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                {product.description?.split('\n').map((paragraph, index) => (
                  paragraph.trim() && <p key={index}>{paragraph}</p>
                ))}
                {!product.description && <p>Chưa có mô tả cho sản phẩm này.</p>}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}