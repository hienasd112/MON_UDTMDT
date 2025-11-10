import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast'; 

export default function Layout() {
  return (
    // 1. Thêm một thẻ div bao quanh tất cả để dễ dàng quản lý bố cục
    <div className="flex flex-col min-h-screen">
      {/* 2. Thêm Toaster ở đây, ngay bên trong thẻ div wrapper */}
      
      <Toaster 
        position="top-right" // Vị trí
        reverseOrder={false}
        toastOptions={{
          duration: 4000, // Thời gian 4 giây
        }}
      />
      
      {/* 3. Navbar, Main, Footer nằm ngay bên trong */}
      <Navbar />

      <main className="flex-grow bg-gray-50">
        <Outlet /> 
      </main>

      <Footer /> 
    </div>
  );
}