import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // --- PHẦN CẤU HÌNH PROXY BỊ THIẾU ---
  server: {
    proxy: {
      // Bất kỳ request nào bắt đầu bằng '/api'
      '/api': {
        target: 'http://localhost:5000', // Sẽ được chuyển đến backend (port 5000)
        changeOrigin: true, // Cần thiết để proxy hoạt động
      },
      // Proxy cho thư mục /uploads (để hiển thị ảnh sau này)
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})