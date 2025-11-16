import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, ShoppingCart, Users, Package, AlertCircle, Calendar, BarChart2 } from 'lucide-react';

// --- (1) IMPORT CÁC THƯ VIỆN MỚI ---
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Import CSS cho lịch

// --- (2) ĐĂNG KÝ CÁC MODULE CỦA CHART.JS ---
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// --- (Các helper) ---
const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '0 ₫';
  return amount.toLocaleString('vi-VN') + ' ₫';
};
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  // Chỉ format ngày (YYYY-MM-DD)
  try { return new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }); } catch (e) { return 'Invalid Date'; }
};
const Spinner = () => ( <svg className="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> );

// Component thẻ thống kê (KPI Card)
const StatCard = ({ title, value, icon, colorClass }) => (
  <div className="bg-white p-5 rounded-lg shadow border border-gray-200 flex items-start gap-4">
    <div className={`p-3 rounded-full ${colorClass || 'bg-gray-100 text-gray-600'}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);


// --- (3) COMPONENT DASHBOARD CHÍNH ---
export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State cho bộ lọc ngày (Mặc định là 30 ngày qua)
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date()); // Hôm nay
  
  // State cho dữ liệu
  const [kpiData, setKpiData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  // Hàm gọi API (có thể gọi lại khi lọc)
  const fetchStats = async (start, end) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (start) params.append('startDate', start.toISOString().split('T')[0]);
      if (end) params.append('endDate', end.toISOString().split('T')[0]);
      
      const { data } = await axios.get(`/api/orders/stats?${params.toString()}`);
      
      setKpiData(data.kpi);
      setChartData(data.chartData);
      setTopProducts(data.topProducts);
      setRecentOrders(data.recentOrders);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  // Gọi API lần đầu khi tải trang (với filter 30 ngày)
  useEffect(() => {
    fetchStats(startDate, endDate);
  }, []);

  // Xử lý khi nhấn nút Lọc
  const handleFilter = () => {
    if (!startDate || !endDate) {
       alert("Vui lòng chọn cả ngày bắt đầu và ngày kết thúc.");
       return;
    }
    fetchStats(startDate, endDate);
  };
  
  // Xử lý khi nhấn nút Xóa Lọc (Lấy tất cả)
  const clearFilter = () => {
    setStartDate(null);
    setEndDate(null);
    fetchStats(null, null); // Gọi API để lấy tất cả
  }

  // --- (4) Chuẩn bị dữ liệu cho Biểu đồ ---
  const lineChartData = {
    labels: chartData?.map(d => formatDateTime(d._id)) || [],
    datasets: [
      {
        label: 'Doanh thu (Đã thanh toán)',
        data: chartData?.map(d => d.dailyRevenue) || [],
        borderColor: 'rgb(16, 185, 129)', // Màu xanh emerald
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.1
      },
    ],
  };
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Doanh thu theo ngày' },
    },
  };

  // --- (5) PHẦN RENDER ---
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Tổng quan Dashboard</h1>
      
      {/* --- BỘ LỌC NGÀY --- */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
           <Calendar size={20} className="text-gray-500"/>
           <span className="font-medium text-gray-700">Lọc theo ngày:</span>
        </div>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Ngày bắt đầu"
          className="w-full md:w-40 rounded-md border-gray-300 shadow-sm text-sm"
          dateFormat="dd/MM/yyyy"
        />
         <span className="hidden md:inline">-</span>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          placeholderText="Ngày kết thúc"
          className="w-full md:w-40 rounded-md border-gray-300 shadow-sm text-sm"
          dateFormat="dd/MM/yyyy"
        />
        <button
          onClick={handleFilter}
          disabled={loading}
          className="w-full md:w-auto bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? 'Đang lọc...' : 'Lọc'}
        </button>
         <button
          onClick={clearFilter}
          disabled={loading}
          className="w-full md:w-auto bg-gray-500 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-600 disabled:opacity-50"
        >
          Xem tất cả
        </button>
      </div>

      {/* Thông báo Lỗi/Loading */}
      {error && (
        <div className="text-red-700 bg-red-100 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} /> <span>{error}</span>
        </div>
      )}
      {loading && <div className="text-center py-10"><Spinner /></div>}
      
      {/* --- HIỂN THỊ DỮ LIỆU --- */}
      {!loading && !error && kpiData && (
        <>
          {/* Hàng 1: Các thẻ KPI */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Tổng Doanh Thu (Đã TT)" 
              value={formatCurrency(kpiData.totalRevenue)}
              icon={<DollarSign size={24} />}
              colorClass="bg-emerald-100 text-emerald-700"
            />
            <StatCard 
              title="Tổng Đơn Hàng (Đã TT)" 
              value={kpiData.totalOrders.toLocaleString('vi-VN')}
              icon={<ShoppingCart size={24} />}
              colorClass="bg-blue-100 text-blue-700"
            />
            <StatCard 
              title="Tổng Khách Hàng (All time)" 
              value={kpiData.totalUsers.toLocaleString('vi-VN')}
              icon={<Users size={24} />}
              colorClass="bg-indigo-100 text-indigo-700"
            />
            <StatCard 
              title="Tổng Sản Phẩm (All time)" 
              value={kpiData.totalProducts.toLocaleString('vi-VN')}
              icon={<Package size={24} />}
              colorClass="bg-orange-100 text-orange-700"
            />
          </div>

          {/* Hàng 2: Biểu đồ Doanh thu */}
          <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
             <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
               <BarChart2 size={20} /> Biểu đồ doanh thu (theo ngày)
             </h2>
             <div style={{ height: '350px' }}> {/* Set chiều cao cố định */}
                {chartData && chartData.length > 0 ? (
                   <Line options={lineChartOptions} data={lineChartData} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Không có dữ liệu doanh thu trong khoảng thời gian này.
                  </div>
                )}
             </div>
          </div>
          
          {/* Hàng 3: 2 Bảng (Đơn gần đây & Top SP) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Đơn hàng gần đây */}
            <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
               <h2 className="text-lg font-semibold text-gray-700 mb-4">Đơn hàng gần đây (theo bộ lọc)</h2>
               <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Khách hàng</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Ngày đặt</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentOrders.length > 0 ? recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td className="px-4 py-3 font-medium text-gray-800">{order.user?.fullName || '[Đã xóa]'}</td>
                          <td className="px-4 py-3 text-gray-600">{formatDateTime(order.createdAt)}</td>
                          <td className="px-4 py-3">
                            {order.isPaid ? (
                              <span className="text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Đã TT</span>
                            ) : (
                              <span className="text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">Chờ TT</span>
                            )}
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="3" className="text-center py-4 text-gray-500">Không có đơn hàng nào.</td></tr>
                      )}
                    </tbody>
                 </table>
               </div>
            </div>

            {/* Top sản phẩm bán chạy */}
            <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
               <h2 className="text-lg font-semibold text-gray-700 mb-4">Top 5 sản phẩm bán chạy (theo bộ lọc)</h2>
               <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Sản phẩm</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase">Số lượng bán</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {topProducts.length > 0 ? topProducts.map((product) => (
                        <tr key={product._id}>
                          <td className="px-4 py-3 font-medium text-gray-800">{product.name || '[SP đã xóa]'}</td>
                          <td className="px-4 py-3 text-gray-600 font-bold">{product.totalQuantitySold}</td>
                        </tr>
                      )) : (
                         <tr><td colSpan="2" className="text-center py-4 text-gray-500">Không có dữ liệu.</td></tr>
                      )}
                    </tbody>
                 </table>
               </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}