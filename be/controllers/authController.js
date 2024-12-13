import User from '../models/UserModel';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import nodemailer from 'nodemailer';
import crypto from 'crypto-browserify';
// Đăng ký người dùng
export const register = async (req, res) => {

  const { userName, email, password, avatars } = req.body;
  console.log({ userName, email, password, avatars })


  try {
    // Kiểm tra xem email đã tồn tại chưa
    const emailExists = await User.findOne({ email });
    console.log(emailExists)
    if (emailExists) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Email đã được đăng ký!" });
    }
    
    // Mã hóa mật khẩu
    const hashPassword = await bcryptjs.hash(password, 10);

    // Gán avatar mặc định nếu không có
    const defaultAvatar = [{ url: " " }];
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
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "cuongbaqph35403@fpt.edu.vn",
    pass: "fvbt fwhb vzfx nogu",
  },
});
// Quên mật khẩu
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email : email });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Email chưa được đăng ký,vui lòng nhập lại email" });
    }
    const token = crypto.randomBytes(20).toString("hex");
  
    // Lưu token vào tài khoản người dùng để xác minh trong resetPassword
    user.resetToken = token;
    user.resetTokenExpires = Date.now() + 15 * 60 * 1000; // 15 phút
    await user.save();

    const mailOptions = {
      from: "cuongbaqph35403@fpt.edu.vn",
      to: email,
      subject: "Reset mật khẩu",
      text: `Bạn nhận được email này vì bạn (hoặc ai đó) yêu cầu đặt lại mật khẩu cho tài khoản của bạn.\n\n
        Vui lòng nhấp vào liên kết dưới đây hoặc sao chép và dán vào trình duyệt của bạn để hoàn tất quy trình:\n\n
        http://localhost:5173/reset-password/${token}\n\n
        Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này và mật khẩu của bạn sẽ không thay đổi.\n`,
    };
    await transporter.sendMail(mailOptions);
    res.status(StatusCodes.OK).json({ message: "Email đặt lại mật khẩu đã được gửi!." });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi máy chủ' });
  }
};

// Đặt lại mật khẩu
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({resetToken: token, resetTokenExpires: { $gt: Date.now() } });
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
export const checkEmail = async (req, res) => {
  const { email } = req.params;

    try {
        // Tìm kiếm người dùng với email này trong cơ sở dữ liệu
        const user = await User.findOne({ email: email });

        // Nếu tìm thấy người dùng, trả về thông báo rằng email đã tồn tại
        if (user) {
            return res.status(400).json({ exists: true, message: 'Email này đã được đăng ký.' });
        }

        // Nếu không tìm thấy người dùng, email có thể được sử dụng
        res.status(200).json({ exists: false, message: 'Email có thể được sử dụng.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Có lỗi xảy ra trong quá trình kiểm tra email.' });
    }
}

