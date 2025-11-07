import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Upload, Trash2, AlertCircle } from 'lucide-react';

// --- (Copy/Paste các component Input, Select, Textarea, Spinner vào đây) ---
const Spinner = ({ size = 'h-5 w-5', color = 'text-white' }) => ( <svg className={`animate-spin ${size} ${color}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> );
const Input = ({ label, name, type = 'text', error = '', ...props }) => ( <div> <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label} {props.required && <span className="text-red-500">*</span>}</label> <input type={type} id={name} name={name} {...props} className={`block w-full rounded-md shadow-sm sm:text-sm ${ error ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'}`} /> {error && <p className="mt-1 text-xs text-red-600">{error}</p>} </div> );
const Select = ({ label, name, children, error = '', ...props }) => ( <div> <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label} {props.required && <span className="text-red-500">*</span>}</label> <select id={name} name={name} {...props} className={`block w-full rounded-md shadow-sm sm:text-sm ${ error ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'}`} > {children} </select> {error && <p className="mt-1 text-xs text-red-600">{error}</p>} </div> );
const Textarea = ({ label, name, rows = 4, error = '', ...props }) => ( <div> <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label} {props.required && <span className="text-red-500">*</span>}</label> <textarea id={name} name={name} rows={rows} {...props} className={`block w-full rounded-md shadow-sm sm:text-sm ${ error ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'}`} ></textarea> {error && <p className="mt-1 text-xs text-red-600">{error}</p>} </div> );


// --- Component Chính ---
export default function AdminProductEdit() {
  const { id: productId } = useParams();
  const navigate = useNavigate();

  // Luôn khởi tạo là MẢNG RỖNG
  const [categories, setCategories] = useState([]); 
  
  const [formData, setFormData] = useState({
    name: '', sku: '',
    price: 0, 
    // (Không có oldPrice)
    stock: 0, category: '', description: '',
    images: [],
    movement: '', caseMaterial: '', strapMaterial: '',
    waterResistance: '', caseSize: '', glassType: '',
  });

  const [loading, setLoading] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Tải danh mục và sản phẩm
  useEffect(() => {
    // --- HÀM LẤY CATEGORY (Phiên bản an toàn) ---
    const fetchCategories = async () => {
      console.log("AdminProductEdit: Đang gọi /api/categories...");
      try {
        const { data } = await axios.get('/api/categories');
        
        // KIỂM TRA NGHIÊM NGẶT: Phải là mảng
        if (Array.isArray(data)) {
          setCategories(data); 
          console.log("AdminProductEdit: Tải categories thành công (là mảng).");
        } else {
          // Nếu API trả về (ví dụ: { message: "lỗi" } hoặc "string")
          console.error("Lỗi tải categories: API không trả về mảng. Data:", data);
          setError('Không thể tải danh sách hãng (dữ liệu không phải mảng).');
          setCategories([]); // Gán mảng rỗng để không crash .map()
        }
      } catch (err) { 
        console.error("Lỗi API /api/categories:", err);
        setError('Lỗi server khi tải danh sách hãng.');
        setCategories([]); // Gán mảng rỗng
      }
    };
    // --- (Kết thúc hàm) ---

    const fetchProduct = async () => {
      console.log(`AdminProductEdit: Đang gọi /api/products/${productId}`);
      try {
        const { data } = await axios.get(`/api/products/${productId}`);
        setFormData({
          name: data.name || '',
          sku: data.sku || '',
          price: data.price || 0,
          stock: data.stock || 0,
          category: data.category?._id || data.category || '', // Lấy ID
          description: data.description || '',
          images: data.images || [],
          movement: data.movement || '',
          caseMaterial: data.caseMaterial || '',
          strapMaterial: data.strapMaterial || '',
          waterResistance: data.waterResistance || '',
          caseSize: data.caseSize || '',
          glassType: data.glassType || '',
        });
      } catch (err) {
        setError("Không thể tải thông tin sản phẩm. " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchCategories(); // Gọi hàm lấy hãng
    fetchProduct();    // Gọi hàm lấy sản phẩm
  }, [productId]);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setError('');
    setFormErrors(prev => ({...prev, [name]: ''}));
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };


  const handleUploadImage = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const uploadFormData = new FormData(); uploadFormData.append('image', file);
    setLoadingUpload(true); setError('');
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await axios.post('/api/upload', uploadFormData, config);
      setFormData((prev) => ({ ...prev, images: [...prev.images, data.image] }));
    } catch (err) { setError("Lỗi upload ảnh: " + (err.response?.data?.message || err.message)); }
    finally { setLoadingUpload(false); e.target.value = null; }
  };


  // Xử lý xóa ảnh

  const handleDeleteImage = (imageToDelete) => {
    if (window.confirm('Xóa ảnh này?')) {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((img) => img !== imageToDelete),
      }));
    }
  };


  // Kiểm tra form
  const validateForm = () => {
     const errors = {};
     if (!formData.name.trim() || formData.name === 'Tên sản phẩm mẫu') errors.name = "Tên sản phẩm là bắt buộc.";
     if (!formData.sku.trim() || formData.sku.startsWith('SKU_MAU_')) errors.sku = "Mã SKU là bắt buộc và phải là duy nhất.";
     if (!formData.category) errors.category = "Vui lòng chọn danh mục.";
     if (formData.price <= 0) errors.price = "Giá bán phải lớn hơn 0.";
     if (formData.stock < 0) errors.stock = "Tồn kho không được âm.";
     if (!formData.description.trim() || formData.description === 'Mô tả mẫu') errors.description = "Mô tả là bắt buộc.";
     if (!formData.images || formData.images.length === 0) errors.images = "Cần có ít nhất 1 ảnh.";

     setFormErrors(errors);
     return Object.keys(errors).length === 0;
  };

  // Xử lý Lưu thay đổi
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
        setError("Vui lòng kiểm tra lại các trường thông tin.");
        return;
    }
    setLoadingSave(true);
    try {
      // formData gửi đi đã không còn oldPrice
      await axios.put(`/api/products/${productId}`, formData);
      alert('Cập nhật sản phẩm thành công!');
      navigate('/admin/products');
    } catch (err) {
      setError("Lỗi khi cập nhật: " + (err.response?.data?.message || err.message));
    } finally {
      setLoadingSave(false);
    }
  };


  // --- GIAO DIỆN ---
  if (loading) return <div className="text-center py-10"><Spinner size="h-8 w-8" color="text-emerald-600"/> Đang tải...</div>;
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/admin/products" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft size={16} /> Quay lại danh sách
      </Link>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {/* Đổi tiêu đề nếu là sản phẩm mẫu */}
        {formData.name === 'Tên sản phẩm mẫu' ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'}
      </h1>

      {error && (
         <div className="mb-4 text-red-700 bg-red-100 p-4 rounded-lg border border-red-300 flex items-center gap-2">
           <AlertCircle size={20} />
           <span>{error}</span>
           <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700 font-bold">&times;</button>
         </div>
       )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* --- Thông tin cơ bản --- */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Thông tin cơ bản</h2>
          <Input label="Tên sản phẩm" name="name" value={formData.name} onChange={handleChange} required error={formErrors.name} />
          <Input label="Mã SKU" name="sku" value={formData.sku} onChange={handleChange} required error={formErrors.sku} />
          
          {/* --- DÒNG 236 ĐANG LỖI --- */}
          <Select label="Danh mục (Hãng)" name="category" value={formData.category} onChange={handleChange} required error={formErrors.category}>
            <option value="">-- Chọn danh mục --</option>
            {/* Code này sẽ an toàn vì 'categories' LUÔN LUÔN là mảng */}
            {categories.map(cat => ( 
              <option key={cat._id} value={cat._id}>{cat.name}</option> 
            ))}
          </Select>
          
          <Textarea label="Mô tả" name="description" value={formData.description} onChange={handleChange} required error={formErrors.description} />
        </div>

        {/* --- Giá & Kho (Phiên bản cũ) --- */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
           <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Giá & Tồn kho</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                 label="Giá bán" name="price" type="number" 
                 value={formData.price} onChange={handleChange} 
                 placeholder="VD: 4500000"
                 required min="0" error={formErrors.price}
              />
              <Input label="Tồn kho" name="stock" type="number" value={formData.stock} onChange={handleChange} required min="0" error={formErrors.stock}/>
           </div>
        </div>
        
        {/* --- Ảnh --- */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
           <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Hình ảnh</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {formData.images.map((img, index) => (
                    <div key={index} className="relative group aspect-square border rounded overflow-hidden">
                        <img src={img.startsWith('http') ? img : `/${img.replace(/\\/g, '/')}`} alt={`Ảnh ${index+1}`} className="w-full h-full object-contain p-1"/>
                        <button type="button" onClick={() => handleDeleteImage(img)} className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition" title="Xóa ảnh này"><Trash2 size={14} /></button>
                    </div>
                ))}
            </div>
            <div>
                <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-1">Thêm ảnh mới</label>
                <div className="flex items-center gap-2">
                   <input type="file" id="image-upload" onChange={handleUploadImage} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 disabled:opacity-50" disabled={loadingUpload}/>
                   {loadingUpload && <Spinner size="h-5 w-5" color="text-gray-500"/>}
                </div>
                 {formErrors.images && <p className="mt-1 text-xs text-red-600">{formErrors.images}</p>}
            </div>
        </div>
        
        {/* --- Thông số kỹ thuật --- */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
           <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Thông số kỹ thuật</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Bộ máy" name="movement" value={formData.movement} onChange={handleChange} />
              <Input label="Chất liệu vỏ" name="caseMaterial" value={formData.caseMaterial} onChange={handleChange} />
              <Input label="Chất liệu dây" name="strapMaterial" value={formData.strapMaterial} onChange={handleChange} />
              <Input label="Chống nước" name="waterResistance" value={formData.waterResistance} onChange={handleChange} />
              <Input label="Kích thước mặt" name="caseSize" value={formData.caseSize} onChange={handleChange} placeholder="VD: 40 mm"/>
              <Input label="Mặt kính" name="glassType" value={formData.glassType} onChange={handleChange} />
           </div>
        </div>

        {/* --- Nút Lưu --- */}
        <div className="flex justify-end pt-4 border-t">
          <button type="submit" disabled={loadingSave || loadingUpload} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
             {loadingSave ? <Spinner size="h-5 w-5"/> : <Save size={18} />}
             {loadingSave ? 'Đang lưu...' : 'Lưu sản phẩm'}
          </button>
        </div>
      </form>
    </div>
  );
}