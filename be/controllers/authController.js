import User from '../models/UserModel';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';

// Đăng ký người dùng
export const register = async (req, res) => {
  const { userName, email, password, avatars } = req.body;

  try {
    // Kiểm tra xem email đã tồn tại chưa
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Email đã tồn tại!" });
    }

    // Mã hóa mật khẩu
    const hashPassword = await bcryptjs.hash(password, 10);

    // Gán avatar mặc định nếu không có
    const defaultAvatar = [{ url: "be/image/avt.jpg" }];
    const userAvatars = avatars && avatars.length > 0 ? avatars : defaultAvatar;

    // Tạo người dùng mới
    const user = new User({
      email,
      userName,
      avatars: userAvatars,
      password: hashPassword,
    });

    await user.save(); // Lưu người dùng vào cơ sở dữ liệu

    console.log("Created User:", user);
    res.status(StatusCodes.CREATED).json({
      message: "Đăng ký thành công!",
      data: { ...user.toObject(), password: undefined },
    });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi :' + error.message });
  }
};


  
