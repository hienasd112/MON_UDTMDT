import React from "react";
import { Outlet } from "react-router-dom"; 
import Navbar from "./Navbar"; 
import Footer from "./Footer"; 

export default function Layout() {
  return (
    // Flex container để đẩy chân trang xuống
    <div className="flex min-h-screen flex-col">
      <Navbar /> {/* hiển thị thanh điều hướng */}

      {/* Khu vực nội dung chính nơi các thành phần trang sẽ được hiển thị*/}
      {/* flex-grow cho phép phần này chiếm không gian có sẵn */}
      <main className="flex-grow bg-gray-50"> {/* Đã thêm nền màu xám nhạt */}
        <Outlet /> {/* Hiển thị thành phần trang cụ thể (Trang chủ, Chi tiết sản phẩm, v.v.) */}
      </main>

      <Footer /> {/* Hiển thị chân trang ở phía dưới */}
    </div>
  );
}