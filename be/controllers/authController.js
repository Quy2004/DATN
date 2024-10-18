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
    console.log(emailExists)
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

// Đăng nhập
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Kiểm tra xem email có trong cơ sở dữ liệu không
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Tài khoản không hợp lệ" });
    }

    // So sánh mật khẩu
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Mật khẩu không đúng" });
    }

    // Tạo token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "khoa-bi-mat", { expiresIn: "1h" });

    // Trả về thông tin người dùng và token
    res.status(StatusCodes.OK).json({
      message: "Đăng nhập thành công!",
      user: { ...user.toObject(), password: undefined },
      token,
    });
  } catch (error) {
    console.error(error); 
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi máy chủ' });
  }
};