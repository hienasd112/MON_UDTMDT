import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MapPin, Phone, Mail, Send } from 'lucide-react';

// Component Input (tái sử dụng từ Checkout)
const Input = ({ label, name, type = 'text', value, onChange, required = false, placeholder = '' }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type} id={name} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder}
      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
    />
  </div>
);

// Component Textarea
const Textarea = ({ label, name, value, onChange, required = false, rows = 4 }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      id={name} name={name} value={value} onChange={onChange} required={required} rows={rows}
      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
    ></textarea>
  </div>
);

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const promise = axios.post('/api/contact', formData);

    toast.promise(promise, {
      loading: 'Đang gửi tin nhắn...',
      success: (res) => {
        setLoading(false);
        // Xóa form
        setFormData({ name: '', email: '', subject: '', message: '' });
        return res.data.message || 'Gửi tin nhắn thành công!';
      },
      error: (err) => {
        setLoading(false);
        return err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
      }
    });
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">Liên hệ với chúng tôi</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 md:p-12 rounded-lg shadow-lg border border-gray-200">
        
        {/* Cột Trái: Thông tin liên hệ */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-700">Thông tin liên hệ</h2>
          <p className="text-gray-600">
            Chúng tôi luôn sẵn sàng lắng nghe bạn. Vui lòng sử dụng biểu mẫu bên cạnh hoặc liên hệ trực tiếp qua thông tin dưới đây.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-emerald-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-800">Địa chỉ</h3>
                <p className="text-sm text-gray-600">123 Đường Bùi Quang Là, Phường 12, Quận Gò Vấp, TP. Hồ Chí Minh</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone size={20} className="text-emerald-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-800">Điện thoại</h3>
                <p className="text-sm text-gray-600">0364.389.055</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail size={20} className="text-emerald-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-800">Email</h3>
                <p className="text-sm text-gray-600">hotro@watchstore.com</p>
              </div>
            </div>
          </div>
          
          {/* Bản đồ (Tùy chọn) */}
          <div className="mt-6 h-48 w-full overflow-hidden rounded-lg border border-gray-300">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4474742617346!2d106.69741001474966!3d10.77698599232076!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3855ab6603%3A0x64f69a531f0814f9!2zQ2jhu6MgQuG6v24gVGjDoG5o!5e0!3m2!1svi!2s!4v1678888888888!5m2!1svi!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
        
        {/* Cột Phải: Form liên hệ */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Gửi tin nhắn cho chúng tôi</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Họ và tên" name="name" value={formData.name} onChange={handleChange} required />
            <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            <Input label="Chủ đề" name="subject" value={formData.subject} onChange={handleChange} required />
            <Textarea label="Nội dung tin nhắn" name="message" value={formData.message} onChange={handleChange} required />
            <div>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full flex justify-center items-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
        
      </div>
    </div>
  );
}