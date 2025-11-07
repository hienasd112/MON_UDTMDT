import bcrypt from "bcryptjs";

// Mã hóa mật khẩu trước
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash("123123", salt);

const users = [
  {
    fullName: "Admin User",
    email: "admin@example.com",
    password: hashedPassword,
    role: "admin",
    phone: "0900000001",
    address: {
      street: "1 Admin St",
      ward: "P. Bến Nghé",
      district: "Q. 1",
      city: "TP. Hồ Chí Minh",
    },
  },
  {
    fullName: "Admin Hien",
    email: "hien@gmail.com",
    password: 123123,
    role: "admin",
    phone: "0364389055",
    address: {
      street: "2 Admin St",
      ward: "P. 12",
      district: "Q. Gò Vấp",
      city: "TP. Hồ Chí Minh",
    },
  },
  
];

export default users;