import User from '../models/UserModel';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';

// Đăng ký người dùng
export const register = async (req, res) => {
  const { userName, email, password, avatars } = req.body;
  console.log({ userName, email, password, avatars });

  try {
    const emailExists = await User.findOne({ email });
    console.log(emailExists);
    if (emailExists) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Email đã tồn tại!" });
    }

    const hashPassword = await bcryptjs.hash(password, 10);
    const defaultAvatar = [{ url: "be/image/avt.jpg" }];
    const userAvatars = avatars && avatars.length > 0 ? avatars : defaultAvatar;

    const user = new User({
      email,
      userName,
      avatars: userAvatars,
      password: hashPassword,
    });

    await user.save();

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
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Tài khoản không hợp lệ" });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Mật khẩu không đúng" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "khoa-bi-mat", { expiresIn: "1h" });

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

// Quên mật khẩu
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Email không tồn tại trong hệ thống" });
    }

    // Tạo token đặt lại mật khẩu, có thời hạn 15 phút
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "khoa-bi-mat", { expiresIn: "15m" });

    // Lưu token vào tài khoản người dùng để xác minh trong resetPassword
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 15 * 60 * 1000; // 15 phút
    await user.save();

    res.status(StatusCodes.OK).json({ message: "Đã tạo token đặt lại mật khẩu, hãy sử dụng token này để đặt lại mật khẩu của bạn.", resetToken });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi máy chủ' });
  }
};

// Đặt lại mật khẩu
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "khoa-bi-mat");
    const user = await User.findOne({ _id: decoded.id, resetToken: token, resetTokenExpires: { $gt: Date.now() } });

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    const hashPassword = await bcryptjs.hash(newPassword, 10);
    user.password = hashPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.status(StatusCodes.OK).json({ message: "Đặt lại mật khẩu thành công!" });
  } catch (error) {
    console.error(error);
    if (error.name === 'TokenExpiredError') {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Token đã hết hạn' });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi máy chủ' });
  }
};

// cập nhật user
export const updateUser = async (req, res) => {
  const { userId } = req.params;  // Lấy ID người dùng từ tham số route
  const { userName, email, avatars } = req.body; // Dữ liệu cần cập nhật

  try {
    // Tìm và cập nhật thông tin người dùng
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { userName, email, avatars },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Không tìm thấy người dùng" });
    }

    res.status(StatusCodes.OK).json({
      message: "Cập nhật thông tin thành công",
      user: { ...updatedUser.toObject(), password: undefined },
    });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi máy chủ' });
  }
};


