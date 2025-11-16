import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, Mail, User, Clock, MessageSquare, Send } from 'lucide-react';

// (Helper format ngày giờ)
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try { return new Date(dateString).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (e) { return 'Invalid Date'; }
};
const Spinner = () => ( <svg className="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> );

export default function AdminContactList() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await axios.get('/api/contact'); // Gọi API mới
        setMessages(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi khi tải tin nhắn');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Quản lý Liên hệ</h1>
      
      {loading && <div className="text-center py-10"><Spinner /></div>}
      
      {error && (
        <div className="mb-4 text-red-700 bg-red-100 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} /> <span>{error}</span>
        </div>
      )}

      {!loading && !error && messages.length === 0 && (
         <div className="text-center py-10 text-gray-500 bg-white shadow rounded-lg p-6">
           Không có tin nhắn liên hệ nào.
         </div>
      )}

      {!loading && !error && messages.length > 0 && (
        <div className="space-y-6">
          {messages.map((msg) => (
            <div key={msg._id} className="bg-white p-5 rounded-lg shadow border border-gray-200">
              {/* Hàng 1: Chủ đề & Ngày gửi */}
              <div className="flex justify-between items-center border-b pb-3 mb-3">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <MessageSquare size={18} className="text-emerald-600" />
                  {msg.subject}
                </h3>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock size={14} /> {formatDateTime(msg.createdAt)}
                </span>
              </div>
              {/* Hàng 2: Thông tin người gửi */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-3">
                 <span className="flex items-center gap-1.5"><User size={14} /> {msg.name}</span>
                 <span className="flex items-center gap-1.5"><Mail size={14} /> {msg.email}</span>
              </div>
              {/* Hàng 3: Nội dung tin nhắn */}
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                {msg.message}
              </p>
              {/* Hàng 4: Nút trả lời */}
              <div className="mt-4">
                 <a 
                   href={`mailto:${msg.email}?subject=RE: ${msg.subject}`}
                   className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-800 border border-emerald-600 px-3 py-1 rounded-md hover:bg-emerald-50 transition"
                 >
                   <Send size={14} /> Trả lời qua Email
                 </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}