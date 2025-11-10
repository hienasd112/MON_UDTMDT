import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchProducts } from '../services/product';
import ProductCard from '../components/ProductCard';

// Hàm helper để phân tích query string (ví dụ: ?keyword=rolex)
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("Tất cả sản phẩm");
  
  const query = useQuery();
  const location = useLocation();

  useEffect(() => {
    // Lấy các tham số từ URL
    const keyword = query.get('keyword');
    const brand = query.get('brand');
    const movement = query.get('movement');
    
    const params = {};
    if (keyword) {
      params.keyword = keyword;
      setTitle(`Kết quả tìm kiếm cho "${keyword}"`);
    } else if (brand) {
      params.brand = brand;
       setTitle(`Thương hiệu: ${brand}`);
    } else if (movement) {
      params.movement = movement;
       setTitle(`Loại máy: ${movement}`);
    } else {
       setTitle("Tất cả sản phẩm");
    }

    // Gọi API với các tham số
    (async () => {
      try {
        setLoading(true);
        const data = await fetchProducts(params);
        if (Array.isArray(data.products)) {
           setProducts(data.products);
        }
      } catch (error) {
        console.error("Lỗi khi tải trang sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    })();
    
  }, [location.search]); // Chạy lại mỗi khi URL query thay đổi

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="mb-8 text-3xl font-bold text-gray-800">{title}</h1>
      
      {loading ? (
        <div className="text-center text-gray-600">Đang tải sản phẩm...</div>
      ) : (
        <>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-10">
              <p className="text-lg">Không tìm thấy sản phẩm nào.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}