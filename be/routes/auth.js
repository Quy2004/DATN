import express from 'express';
import {  register, login } from '../controllers/authController.js';

const authRouter = express.Router();

// Đăng ký 
authRouter.post('/register', register);

// Đăng nhập 
authRouter.post('/login', login);

export default authRouter;
