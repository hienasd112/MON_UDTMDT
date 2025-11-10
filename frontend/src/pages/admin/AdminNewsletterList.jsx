import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, Mail, Clock } from 'lucide-react';

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try { return new Date(dateString).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (e) { return 'Invalid Date'; }
};
const Spinner = () => ( <svg className="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> );

export default function AdminNewsletterList() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await axios.get('/api/newsletter'); // Gọi API mới
        setSubscribers(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi khi tải danh sách');
      } finally {
        setLoading(false);
      }
    };
    fetchSubscribers();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Quản lý Đăng ký nhận tin</h1>
      
      {loading && <div className="text-center py-10"><Spinner /></div>}
      
      {error && (
        <div className="mb-4 text-red-700 bg-red-100 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} /> <span>{error}</span>
        </div>
      )}

      {!loading && !error && subscribers.length === 0 && (
         <div className="text-center py-10 text-gray-500 bg-white shadow rounded-lg p-6">
           Chưa có ai đăng ký nhận tin.
         </div>
      )}

      {!loading && !error && subscribers.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email đăng ký</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đăng ký</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscribers.map((sub) => (
                <tr key={sub._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <Mail size={16} className="text-gray-500" />
                      <a href={`mailto:${sub.email}`} className="hover:text-emerald-700">{sub.email}</a>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={16} className="text-gray-500" />
                      {formatDateTime(sub.subscribedAt)}
                    </div>
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