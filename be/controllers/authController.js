import User from '../models/UserModel';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken'
import { StatusCodes } from 'http-status-codes';

// Đăng ký người dùng
export const register = async (req, res) => {
  const { username, email, password,phone,name } = req.body;

  try {
    // Kiểm tra xem email đã tồn tại chưa
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Email đã được đăng kí!" });
    }

    // Kiểm tra xem userName đã tồn tại chưa
    const userNameExists = await User.findOne({ username });
    if (userNameExists) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Tên người dùng đã được đăng kí!" });
    }
    // Kiểm tra xem phone đã tồn tại chưa
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Số điện thoại đã được đăng kí!" });
    }
    // Mã hóa mật khẩu
    const hashPassword = await bcryptjs.hash(password, 10);

    // Tạo người dùng mới
    const user = new User({
      name,
      phone,
      email,
      username,
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
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi máy chủ'+error.message });
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
