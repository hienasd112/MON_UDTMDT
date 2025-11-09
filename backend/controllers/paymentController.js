import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import { format } from 'date-fns'; // Thư viện format ngày
import qs from 'qs'; // Thư viện tạo query string chuẩn

/**
 * Helper: Sắp xếp các thuộc tính của object theo A-Z
 * @param {object} obj - Object cần sắp xếp
 * @returns {object} - Object đã sắp xếp
 */
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    // --- SỬA LỖI 'hasOwnProperty' TẠI ĐÂY ---
    // if (obj.hasOwnProperty(key)) { // Gây lỗi 500 vì req.query không có hàm này
    if (Object.prototype.hasOwnProperty.call(obj, key)) { // ✅ Cách sửa an toàn
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
}

// @desc   Tạo URL thanh toán VNPAY
// @route  POST /api/payment/create-vnpay-url
// @access Private
const createVnpayPaymentUrl = asyncHandler(async (req, res) => {
  // Lấy IP của client
  const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;

  const { orderId, amount, language = 'vn', bankCode = '' } = req.body;

  if (!orderId || !amount) {
     res.status(400); 
     throw new Error('Thiếu ID đơn hàng hoặc số tiền');
  }

  // Lấy thông tin cấu hình từ file .env
  const tmnCode = process.env.VNP_TMN_CODE;
  const secretKey = process.env.VNP_HASH_SECRET; // HashSecret
  const vnpUrl = process.env.VNP_URL;
  const returnUrl = process.env.VNP_RETURN_URL; // URL backend nhận kết quả

  if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
     res.status(500);
     throw new Error('Lỗi cấu hình VNPAY. Vui lòng kiểm tra file .env');
  }

  const createDate = new Date();
  const vnp_CreateDate = format(createDate, 'yyyyMMddHHmmss');
  // Thêm timestamp (HHmmss) vào mã đơn hàng để đảm bảo vnp_TxnRef là duy nhất
  const vnp_TxnRef = `${orderId}_${format(createDate, 'HHmmss')}`; 

  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = language;
  vnp_Params['vnp_CurrCode'] = 'VND';
  vnp_Params['vnp_TxnRef'] = vnp_TxnRef; // Mã tham chiếu (mã đơn hàng)
  vnp_Params['vnp_OrderInfo'] = `Thanh toan don hang ${vnp_TxnRef}`;
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Amount'] = amount * 100; // VNPAY yêu cầu nhân 100
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = vnp_CreateDate;

  if (bankCode) {
    vnp_Params['vnp_BankCode'] = bankCode;
  }

  // Sắp xếp các tham số
  vnp_Params = sortObject(vnp_Params);

  // --- SỬA LỖI 97 (Chữ ký): Dùng 'qs' ---
  // Tạo chuỗi ký (hash data)
  const signData = qs.stringify(vnp_Params, { encode: false });

  // Tạo chữ ký
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  vnp_Params['vnp_SecureHash'] = signed;

  // Tạo URL cuối cùng
  const paymentUrl = vnpUrl + '?' + qs.stringify(vnp_Params, { encode: false });

  console.log("Tạo VNPAY URL thành công:", paymentUrl);
  res.status(200).json({ paymentUrl });
});


// @desc   Xử lý kết quả VNPAY trả về (Return URL)
// @route  GET /api/payment/vnpay-return
// @access Public
const vnpayReturn = asyncHandler(async (req, res) => {
  let vnp_Params = req.query; // Lấy tham số từ VNPAY
  const secureHash = vnp_Params['vnp_SecureHash'];

  // Xóa chữ ký và loại chữ ký khỏi tham số
  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  // Sắp xếp lại (hàm đã sửa lỗi)
  vnp_Params = sortObject(vnp_Params);

  const secretKey = process.env.VNP_HASH_SECRET;
  
  // --- SỬA LỖI 97 (Chữ ký): Dùng 'qs' ---
  const querystring = qs.stringify(vnp_Params, { encode: false });

  // Tạo lại chữ ký
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(querystring, 'utf-8')).digest('hex');

  const orderId = vnp_Params['vnp_TxnRef'].split('_')[0]; // Lấy lại ID đơn hàng gốc
  const responseCode = vnp_Params['vnp_ResponseCode'];
  
// (Đổi localhost:5173 thành tên miền frontend của bạn khi deploy)
  const frontend_FailUrl = `http://localhost:5173/checkout?payment=fail&orderId=${orderId}`;
  const frontend_SuccessUrl = `http://localhost:5173/order/${orderId}`;

  // 1. Kiểm tra chữ ký (secureHash từ VNPAY === signed do mình tạo lại)
  if (secureHash === signed) {
    console.log("VNPAY Return: Chữ ký hợp lệ.");
    
    // 2. Kiểm tra mã giao dịch (00 = thành công)
    if (responseCode === '00') {
      try {
        const order = await Order.findById(orderId);
        if (order) {
          if (order.isPaid) {
             console.log("VNPAY Return: Đơn hàng này đã được thanh toán trước đó.");
             res.redirect(frontend_SuccessUrl); 
             return;
          }
          
          // Cập nhật đơn hàng
          order.isPaid = true;
          order.paidAt = new Date();
          // (Lưu thêm thông tin VNPAY nếu cần, vd: vnp_Params)
          await order.save();
          
          console.log("VNPAY Return: Cập nhật đơn hàng thành công.");
          res.redirect(frontend_SuccessUrl); // Chuyển về trang chi tiết đơn hàng
        } else {
          console.error("VNPAY Return: Không tìm thấy đơn hàng:", orderId);
          res.redirect(frontend_FailUrl);
        }
      } catch (error) {
         console.error("VNPAY Return: Lỗi khi cập nhật Database:", error);
         res.redirect(frontend_FailUrl); 
      }
    } else {
      // Thanh toán thất bại (lý do khác)
      console.log("VNPAY Return: Thanh toán thất bại, mã lỗi VNPAY:", responseCode);
      res.redirect(frontend_FailUrl);
    }
  } else {
    // Chữ ký không hợp lệ
    console.error("VNPAY Return: Lỗi - Chữ ký không hợp lệ!");
    res.redirect(frontend_FailUrl);
  }
});

export { createVnpayPaymentUrl, vnpayReturn };
