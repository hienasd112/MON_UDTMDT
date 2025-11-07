import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react';

// --- Hàm lấy URL ảnh (Phiên bản an toàn) ---
const getImageUrl = (imagePath) => {
  const fallbackImage = "https://dummyimage.com/100x100/cccccc/ffffff.png&text=N/A";

  // 1. Nếu không có đường dẫn (null, undefined, rỗng)
  if (!imagePath || imagePath.trim() === "") {
    return fallbackImage;
  }

  // 2. Nếu là link ngoài (http...)
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // 3. Tự động sửa lỗi đường dẫn phổ biến
  let fixedPath = imagePath.replace(/\\/g, '/'); // Thay \ thành /
  if (!fixedPath.startsWith('/')) {
    fixedPath = '/' + fixedPath; // Thêm / nếu thiếu
  }

  // 4. Trả về đường dẫn hoàn chỉnh
  const base = ""; // Proxy (nếu cần)
  return `${base}${fixedPath}`;
};

// --- Component Spinner (Biểu tượng xoay) ---
const Spinner = ({ size = 'h-5 w-5', color = 'text-emerald-600' }) => (
  <svg className={`animate-spin ${size} ${color}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);


// --- Component Chính ---
export default function AdminProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingAction, setLoadingAction] = useState(null); // 'create' | 'delete_<id>'
  const navigate = useNavigate();

  // --- Hàm chính: Tải TẤT CẢ sản phẩm ---
  const fetchAdminProducts = async () => {
    try {
      setLoading(true);
      setError('');
      // API này gọi '/api/products' (lấy tất cả sản phẩm, có thể kèm phân trang nếu backend hỗ trợ)
      const { data } = await axios.get('/api/products'); 
      
      // Dữ liệu trả về có thể là { products: [], page: 1, pages: 1 }
      if (Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (Array.isArray(data)) {
         // Hỗ trợ nếu API chỉ trả về mảng
         setProducts(data);
      }
      else {
         throw new Error("Dữ liệu sản phẩm trả về không đúng định dạng (cần mảng 'products').");
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Lỗi không xác định.';
      setError(`Lỗi khi tải danh sách sản phẩm: ${message}`);
      console.error("Fetch Admin Products Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Chỉ gọi 1 lần khi trang được tải
  useEffect(() => {
    fetchAdminProducts();
  }, []);

  // Xử lý Xóa
  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}" không?`)) {
      setLoadingAction(`delete_${id}`);
      setError('');
      try {
        await axios.delete(`/api/products/${id}`); // Gọi API xóa
        // Tải lại danh sách sau khi xóa
        fetchAdminProducts(); // Hoặc lọc state: setProducts(prev => prev.filter(p => p._id !== id))
      } catch (err) {
        const message = err.response?.data?.message || err.message;
        setError(`Lỗi khi xóa sản phẩm "${name}": ${message}`);
      } finally {
         setLoadingAction(null);
      }
    }
  };

  // Xử lý Thêm (Tạo sản phẩm mẫu)
   const handleCreateProduct = async () => {
       if (window.confirm('Tạo một sản phẩm mẫu mới? Bạn sẽ được chuyển đến trang chỉnh sửa.')) {
           setLoadingAction('create');
           setError('');
           try {
               // 1. Gọi API tạo sản phẩm
               const { data: createdProduct } = await axios.post('/api/products', {});
               
               // 2. Kiểm tra kết quả
               if (createdProduct && createdProduct._id) {
                 // 3. Chuyển đến trang Sửa của sản phẩm mới tạo
                 navigate(`/admin/products/${createdProduct._id}/edit`);
               } else {
                 throw new Error("API tạo sản phẩm không trả về _id.");
               }
           } catch (err) {
               const message = err.response?.data?.message || err.message;
               setError(`Lỗi khi tạo sản phẩm mẫu: ${message}`);
               console.error("Create Product Error:", err);
               setLoadingAction(null);
           }
       }
   };

  // --- Render (Giao diện) ---
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tiêu đề và Nút Thêm */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
        <button
          onClick={handleCreateProduct}
          className={`bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition ${loadingAction === 'create' ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loadingAction === 'create' || loading}
        >
          {loadingAction === 'create' ? (
            <> <Spinner size="h-4 w-4" color="text-white"/> Đang tạo... </>
          ) : (
            <> <Plus size={18} /> Thêm sản phẩm </>
          )}
        </button>
      </div>

      {/* Hiển thị Lỗi (nếu có) */}
      {error && (
         <div className="mb-4 text-red-700 bg-red-100 p-4 rounded-lg border border-red-300 flex items-center gap-2">
           <AlertCircle size={20} />
           <span>{error}</span>
           <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700 font-bold">&times;</button>
         </div>
       )}

      {/* Hiển thị "Đang tải..." */}
      {loading ? (
        <div className="text-center py-10 text-gray-600 flex items-center justify-center gap-2">
           <Spinner size="h-8 w-8" />
           Đang tải danh sách sản phẩm...
         </div>
         
      /* Hiển thị "Rỗng" */
      ) : products.length === 0 && !error ? (
         <div className="text-center py-10 text-gray-500 bg-white shadow rounded-lg p-6">
             <p>Chưa có sản phẩm nào. Hãy nhấn "Thêm sản phẩm" để bắt đầu.</p>
         </div>
         
       /* Hiển thị Bảng sản phẩm */
       ) : !error && (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 align-middle">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Ảnh</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Sản phẩm</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Kho</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  {/* --- SỬ DỤNG HÀM getImageUrl --- */}
                  <td className="px-4 py-3">
                    <img
                      // Lấy ảnh đầu tiên trong mảng images
                      src={getImageUrl(product.images && product.images[0])} 
                      alt={product.name}
                      className="h-14 w-14 object-contain rounded bg-gray-50 p-0.5"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs truncate" title={product.name}>{product.name}</td>
                   <td className="px-4 py-3 text-sm text-gray-500">{product.sku}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right whitespace-nowrap">{product.price.toLocaleString('vi-VN')} ₫</td>
                   <td className="px-4 py-3 text-sm text-gray-500 text-center">{product.stock}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {/* Nút Sửa */}
                    <Link
                      to={`/admin/products/${product._id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900 p-1 inline-block"
                      title="Sửa"
                    >
                      <Edit size={18} />
                    </Link>
                    {/* Nút Xóa */}
                    <button
                      onClick={() => handleDelete(product._id, product.name)}
                      className={`text-red-600 hover:text-red-900 p-1 inline-block ${loadingAction === `delete_${product._id}` ? 'opacity-50 cursor-wait' : ''}`}
                      title="Xóa"
                      disabled={loadingAction === `delete_${product._id}`}
                    >
                      {loadingAction === `delete_${product._id}` ? (
                          <Spinner size="h-4 w-4" color="text-red-500"/>
                      ) : (
                          <Trash2 size={18} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}