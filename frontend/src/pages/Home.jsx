import React, { useEffect, useState } from "react";
import { fetchProducts } from "../services/product";
import ProductCard from "../components/ProductCard"; 
import { Link } from "react-router-dom"; 

// --- Helper Components ---
// Thành phần có thể tái sử dụng cho tiêu đề phần
const SectionTitle = ({ title }) => (
  <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
    {title}
  </h2>
);

// Reusable component có thể tái sử dụng cho bố cục lưới sản phẩm
const ProductGrid = ({ products }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
    {products.length > 0 ? (
      products.map((p) => <ProductCard key={p._id} product={p} />)
    ) : (
      // Hiển thị thông báo nếu không tìm thấy sản phẩm nào cho một phần
      <p className="text-center col-span-full text-gray-500 py-8">
        Không có sản phẩm nào thuộc mục này.
      </p>
    )}
  </div>
);

// --- Thành phần chính của trang chủ ---
export default function Home() {
  const [products, setProducts] = useState([]); // tất cả các sản phẩm
  const [loading, setLoading] = useState(true); // Trạng thái theo dõi tình trạng tải

  // Lấy sản phẩm khi thành phần được gắn kết
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchProducts(); // Call the API service
        // Make sure the API response has the products array
        if (Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          console.warn("API response format unexpected:", data);
        }
      } catch (err) {
        console.error("❌ Lỗi tải sản phẩm:", err);
      } finally {
        setLoading(false); // Stop loading indicator regardless of success/failure
      }
    })();
  }, []); // Empty dependency array means this runs only once on mount

  // Filter products for different sections on the page
  const newProducts = products.slice(0, 10); // Get the first 10 products as "New Arrivals"
  const seikoProducts = products.filter(p => p.category?.name === 'Seiko').slice(0, 5); // Get top 5 Seiko
  const tissotProducts = products.filter(p => p.category?.name === 'Tissot').slice(0, 5); // Get top 5 Tissot
  const gshockProducts = products.filter(p => p.category?.name === 'G-Shock').slice(0, 5); // Get top 5 G-Shock

  // Display loading message while fetching data
  if (loading) {
    return <div className="text-center text-gray-600 mt-20 py-10">Đang tải sản phẩm...</div>;
  }

  return (
    <main>
      {/* 1. Hero Banner Section */}
      <div className="relative h-[400px] md:h-[500px] bg-gray-900 text-white flex items-center justify-center">
        {/* Background Image */}
        <img
          src="https://standboothvietnam.com/wp-content/uploads/2023/09/dong-ho-3.jpg"
          alt="Watch Store Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          aria-hidden="true" // Hide decorative image from screen readers
        />
        {/* Banner Content */}
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-md">Bộ Sưu Tập Mới Nhất 2025</h1>
          <p className="text-lg md:text-xl mb-8 drop-shadow">Khẳng định đẳng cấp, lưu giữ thời gian.</p>
          <Link
            to="/products" // Link to a general products page (you might create this later)
            className="bg-emerald-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-emerald-700 transition duration-300 shadow-lg hover:shadow-xl"
          >
            Khám phá ngay
          </Link>
        </div>
      </div>

      {/* 2. "New Arrivals" Section */}
      <section className="container mx-auto px-4 py-16">
        <SectionTitle title="Hàng Mới Về" />
        <ProductGrid products={newProducts} />
      </section>

      {/* 3. "Seiko" Section */}
      <section className="bg-gray-100">
        <div className="container mx-auto px-4 py-16">
          <SectionTitle title="Thương Hiệu Nổi Bật: SEIKO" />
          <ProductGrid products={seikoProducts} />
           <div className="text-center mt-8">
             <Link to="/products?brand=Seiko" className="text-emerald-600 hover:text-emerald-800 font-medium">Xem tất cả Seiko &rarr;</Link>
           </div>
        </div>
      </section>

      {/* 4. "Tissot" Section */}
      <section className="container mx-auto px-4 py-16">
        <SectionTitle title="Thương Hiệu Nổi Bật: TISSOT" />
        <ProductGrid products={tissotProducts} />
        <div className="text-center mt-8">
             <Link to="/products?brand=Tissot" className="text-emerald-600 hover:text-emerald-800 font-medium">Xem tất cả Tissot &rarr;</Link>
           </div>
      </section>

      {/* 5. "G-Shock" Section */}
      <section className="bg-gray-100">
        <div className="container mx-auto px-4 py-16">
          <SectionTitle title="Đồng Hồ Siêu Bền: G-SHOCK" />
          <ProductGrid products={gshockProducts} />
          <div className="text-center mt-8">
             <Link to="/products?brand=G-Shock" className="text-emerald-600 hover:text-emerald-800 font-medium">Xem tất cả G-Shock &rarr;</Link>
           </div>
        </div>
      </section>

    </main>
  );
}