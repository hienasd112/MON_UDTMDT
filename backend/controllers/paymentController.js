import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import { format } from 'date-fns'; // Dùng để format ngày giờ

// --- Helper: Sắp xếp object (bắt buộc của VNPAY) ---
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
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
  // Lấy IP của khách hàng
  // (Cần cấu hình 'trust proxy' trong server.js nếu dùng proxy/Heroku)
  const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;

  const { orderId, amount, language = 'vn', bankCode = '' } = req.body;

  if (!orderId || !amount) {
     res.status(400);
     throw new Error('Thiếu orderId hoặc amount');
  }

  // Lấy thông tin từ .env
  const tmnCode = process.env.VNP_TMN_CODE;
  const secretKey = process.env.VNP_HASH_SECRET;
  let vnpUrl = process.env.VNP_URL;
  const returnUrl = process.env.VNP_RETURN_URL; // URL Backend xử lý

  const createDate = new Date();
  const vnp_CreateDate = format(createDate, 'yyyyMMddHHmmss'); // Format yyyyMMddHHmmss
  
  // Mã đơn hàng (vnp_TxnRef) phải là duy nhất. 
  // Thêm timestamp để đảm bảo nếu user thanh toán lại
  const vnp_TxnRef = `${orderId}_${format(createDate, 'HHmmss')}`;

  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = language;
  vnp_Params['vnp_CurrCode'] = 'VND';
  vnp_Params['vnp_TxnRef'] = vnp_TxnRef; // Mã tham chiếu (Mã đơn hàng)
  vnp_Params['vnp_OrderInfo'] = `Thanh toan don hang ${vnp_TxnRef}`;
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Amount'] = amount * 100; // VNPAY yêu cầu nhân 100
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = vnp_CreateDate;

  if (bankCode !== null && bankCode !== '') {
    vnp_Params['vnp_BankCode'] = bankCode;
  }

  // Sắp xếp params
  vnp_Params = sortObject(vnp_Params);

  // Tạo query string
  const querystring = new URLSearchParams(vnp_Params).toString();

  // Tạo chữ ký
  const signData = querystring;
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  vnp_Params['vnp_SecureHash'] = signed;
  
  // Thêm chữ ký vào URL
  vnpUrl += '?' + new URLSearchParams(vnp_Params).toString();

  console.log("Tạo VNPAY URL thành công:", vnpUrl);
  res.status(200).json({ paymentUrl: vnpUrl });
});


// @desc   Xử lý kết quả VNPAY trả về (Return URL)
// @route  GET /api/payment/vnpay-return
// @access Public
const vnpayReturn = asyncHandler(async (req, res) => {
  let vnp_Params = req.query;
  const secureHash = vnp_Params['vnp_SecureHash'];

  // Xóa hash và hashType khỏi params
  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  // Sắp xếp lại
  vnp_Params = sortObject(vnp_Params);

  const secretKey = process.env.VNP_HASH_SECRET;
  const querystring = new URLSearchParams(vnp_Params).toString();

  // Tạo lại chữ ký
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(querystring, 'utf-8')).digest('hex');

  // Lấy orderId (đã bỏ phần timestamp _HHmmss)
  const orderId = vnp_Params['vnp_TxnRef'].split('_')[0];
  const responseCode = vnp_Params['vnp_ResponseCode'];
  
  // URL để redirect người dùng về frontend
  const frontend_FailUrl = `http://localhost:3000/checkout?payment=fail&orderId=${orderId}`;
  const frontend_SuccessUrl = `http://localhost:3000/order/${orderId}`; // Chuyển về trang chi tiết đơn hàng

  // 1. Kiểm tra chữ ký
  if (secureHash === signed) {
    console.log("VNPAY Return: Chữ ký hợp lệ.");
    
    // 2. Kiểm tra trạng thái thanh toán
    if (responseCode === '00') {
      // 3. Cập nhật đơn hàng
      try {
        const order = await Order.findById(orderId);
        if (order) {
          if (order.isPaid) {
             console.log("VNPAY Return: Đơn hàng này đã được thanh toán trước đó.");
             res.redirect(frontend_SuccessUrl); // Đã thanh toán -> Về trang thành công
             return;
          }
          
          order.isPaid = true;
          order.paidAt = new Date();
          // (Lưu thêm thông tin VNPAY nếu cần)
          // order.paymentResult = { ...vnp_Params }; 
          await order.save();
          
          console.log("VNPAY Return: Cập nhật đơn hàng thành công.");
          res.redirect(frontend_SuccessUrl); // Về trang thành công
        } else {
          console.error("VNPAY Return: Không tìm thấy đơn hàng:", orderId);
          res.redirect(frontend_FailUrl); // Không tìm thấy đơn hàng
        }
      } catch (error) {
         console.error("VNPAY Return: Lỗi khi cập nhật DB:", error);
         res.redirect(frontend_FailUrl); // Lỗi server
      }
    } else {
      // Thanh toán thất bại (lý do khác, vd: hủy, thiếu tiền)
      console.log("VNPAY Return: Thanh toán thất bại, mã lỗi:", responseCode);
      res.redirect(frontend_FailUrl);
    }
  } else {
    // Chữ ký không hợp lệ
    console.error("VNPAY Return: Chữ ký không hợp lệ!");
    res.redirect(frontend_FailUrl);
  }
});


export { createVnpayPaymentUrl, vnpayReturn };