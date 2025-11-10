import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCheck, UserX, Edit, Trash2, AlertCircle, ShieldCheck, User } from 'lucide-react'; 

// Simple Spinner
const Spinner = () => (
    <svg className="animate-spin h-5 w-5 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

export default function AdminUserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingAction, setLoadingAction] = useState(null); // delete_<id>

  const fetchAdminUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await axios.get('/api/users');
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
         throw new Error("Dữ liệu user không hợp lệ.");
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Lỗi không xác định.';
      setError(`Lỗi khi tải danh sách người dùng: ${message}`);
      console.error("Fetch Users Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const handleDeleteUser = async (userId, userName, userRole) => {
    // Double confirm before deleting admin (though backend prevents it)
    let confirmMessage = `Bạn có chắc chắn muốn xóa người dùng "${userName}" không?`;
    if(userRole === 'admin') {
      confirmMessage = `KHÔNG THỂ XÓA ADMIN "${userName}". Bạn có muốn tiếp tục không? (Hành động này sẽ bị chặn bởi server)`;
    }

    if (window.confirm(confirmMessage)) {
      if(userRole === 'admin'){
          setError("Không thể xóa tài khoản Admin từ giao diện này.");
          return; // Prevent API call if admin
      }

      setLoadingAction(`delete_${userId}`);
      setError('');
      try {
        await axios.delete(`/api/users/${userId}`);
        setUsers(prevUsers => prevUsers.filter(u => u._id !== userId));
      } catch (err) {
        const message = err.response?.data?.message || err.message;
        setError(`Lỗi khi xóa người dùng "${userName}": ${message}`);
        console.error("Delete User Error:", err);
      } finally {
        setLoadingAction(null);
      }
    }
  };

  // const handleEditUser = (userId) => {
  //   navigate(`/admin/users/${userId}/edit`); // Need to create this page
  // };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Quản lý Người dùng</h1>

      {error && (
        <div className="mb-4 text-red-700 bg-red-100 p-4 rounded-lg border border-red-300 flex items-center gap-2">
          <AlertCircle size={20} /><span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700 font-bold">&times;</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-600 flex items-center justify-center gap-2"><Spinner/> Đang tải...</div>
      ) : users.length === 0 && !error ? (
        <div className="text-center py-10 text-gray-500 bg-white shadow rounded-lg p-6">Không có người dùng nào.</div>
      ) : !error && (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 align-middle text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ và tên</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-500" title={user._id}>{user._id.substring(0, 8)}...</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{user.fullName}</td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3 text-center">
                    {user.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-0.5 rounded-full text-xs font-semibold">
                          <ShieldCheck size={14} /> Admin
                      </span>
                    ) : (
                       <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full text-xs font-semibold">
                          <User size={14} /> Khách hàng
                       </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right font-medium space-x-2">
                    <button
                      // onClick={() => handleEditUser(user._id)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 inline-block disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Sửa vai trò (Chưa làm)"
                      disabled // Disable edit for now
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id, user.fullName, user.role)}
                      className={`p-1 inline-block ${user.role === 'admin' ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-900'} ${loadingAction === `delete_${user._id}` ? 'opacity-50 cursor-wait' : ''}`}
                      title={user.role === 'admin' ? 'Không thể xóa Admin' : 'Xóa người dùng'}
                      disabled={loadingAction === `delete_${user._id}` || user.role === 'admin'}
                    >
                      {loadingAction === `delete_${user._id}` ? ( <Spinner /> ) : ( <Trash2 size={18} /> )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Add pagination later */}
        </div>
      )}
    </div>
  );
}