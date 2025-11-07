import React, { createContext, useState, useEffect, useMemo } from 'react';        
// Tạo Context
export const CartContext = createContext();

// Hàm lấy giỏ hàng từ localStorage
const getInitialCart = () => {
  try {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error("Lỗi khi đọc giỏ hàng từ localStorage:", error);
    localStorage.removeItem('cart'); // Xóa cart lỗi
    return [];
  }
};

// Component Provider
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(getInitialCart);

  // Lưu vào localStorage mỗi khi cartItems thay đổi
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
       console.error("Lỗi khi lưu giỏ hàng vào localStorage:", error);
    }
  }, [cartItems]);

  // --- Các hàm xử lý giỏ hàng ---

  // Thêm sản phẩm vào giỏ
  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item._id === product._id);
      if (existingItem) {
        // Cập nhật số lượng nếu đã tồn tại
        const newQuantity = existingItem.quantity + quantity;
        // Kiểm tra tồn kho (nếu có thông tin stock)
        // const maxQuantity = product.stock || Infinity;
        // const finalQuantity = Math.min(newQuantity, maxQuantity);
        return prevItems.map(item =>
          item._id === product._id ? { ...item, quantity: newQuantity } : item
        );
      } else {
         // Kiểm tra tồn kho (nếu có thông tin stock)
        // const maxQuantity = product.stock || Infinity;
        // const finalQuantity = Math.min(quantity, maxQuantity);
        return [...prevItems, {
          _id: product._id,
          name: product.name,
          price: product.price,
          images: product.images, // Chỉ cần ảnh đầu tiên?
          // stock: product.stock, // Lưu lại stock để kiểm tra sau
          quantity: quantity
        }];
      }
    });
     console.log(`Đã thêm ${quantity} ${product.name} vào giỏ`);
  };

  // Xóa sản phẩm khỏi giỏ
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
    console.log(`Đã xóa sản phẩm ${productId} khỏi giỏ`);
  };

  // Cập nhật số lượng
  const updateQuantity = (productId, quantity) => {
    const newQuantity = Math.max(1, quantity); // Đảm bảo số lượng >= 1
    setCartItems(prevItems =>
      prevItems.map(item =>
        item._id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
     console.log(`Cập nhật số lượng sản phẩm ${productId} thành ${newQuantity}`);
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = () => {
    setCartItems([]);
     localStorage.removeItem('cart');
    console.log("Đã xóa toàn bộ giỏ hàng");
  };

  // --- Tính toán tổng tiền và số lượng (dùng useMemo để tối ưu) ---
  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  const cartCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  // Giá trị cung cấp cho Context
  const value = {
    cartItems,
    cartTotal,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};