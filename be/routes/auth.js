import express from 'express';
import { register, login, forgotPassword,resetPassword, checkEmail} from '../controllers/authController.js';

const authRouter = express.Router();

// Đăng ký 
authRouter.post('/register', register);

// Đăng nhập 
authRouter.post('/login', login);

// Quên mật khẩu
authRouter.post('/forgot-password', forgotPassword);

// Đặt lại mật khẩu
authRouter.post('/reset-password', resetPassword);
//checkEmail
authRouter.get('/check-email/:email', checkEmail);



export default authRouter;
