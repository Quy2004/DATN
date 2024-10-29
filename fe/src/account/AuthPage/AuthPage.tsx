import React, { useState } from 'react';
import * as Components from './AuthComponents';
import instance from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';


const AuthPage: React.FC = () => {
    const [signIn, setSignIn] = useState<boolean>(true);
    const [registerData, setRegisterData] = useState({ userName: '', email: '', password: '' });
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [error, setError] = useState<string | null>(null);


    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRegisterData({ ...registerData, [name]: value });
    };


    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLoginData({ ...loginData, [name]: value });
    };


    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await instance.post('/auth/register', registerData);
            console.log('Đăng ký thành công:', response.data);
            setSignIn(true);
        } catch (error) {
            console.error('Lỗi đăng ký:', error);
            setError('Có lỗi xảy ra khi đăng ký.');
        }
    };
    const navigate = useNavigate();


    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await instance.post('/auth/login', loginData);
            toast.success('Đăng nhập thành công');
            setTimeout(() => {
                navigate('/');
            }, 2000)

        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            setError('Có lỗi xảy ra khi đăng nhập.');
        }
    };

    return (
        <Components.Section>
            <Components.MidContainer>
                {/* Form Đăng ký */}
                <Components.RegisterContainer $signinIn={signIn}>
                    <Components.Form onSubmit={handleRegisterSubmit}>
                        <Components.Title>Tạo Tài Khoản</Components.Title>
                        <Components.Input
                            type='text'
                            name='userName'
                            placeholder='Tên người dùng'
                            value={registerData.userName}
                            onChange={handleRegisterChange}
                        />
                        <Components.Input
                            type='email'
                            name='email'
                            placeholder='Email'
                            value={registerData.email}
                            onChange={handleRegisterChange}
                        />
                        <Components.Input
                            type='password'
                            name='password'
                            placeholder='Mật khẩu'
                            value={registerData.password}
                            onChange={handleRegisterChange}
                        />
                        <Components.Button type="submit">Đăng Ký</Components.Button>
                    </Components.Form>
                </Components.RegisterContainer>

                {/* Form Đăng nhập */}
                <Components.LoginContainer $signinIn={signIn}>
                    <Components.Form onSubmit={handleLoginSubmit}>
                        <Components.Title>Đăng Nhập</Components.Title>
                        <Components.Input
                            type='email'
                            name='email'
                            placeholder='Email / Số điện thoại'
                            value={loginData.email}
                            onChange={handleLoginChange}
                        />
                        <Components.Input
                            type='password'
                            name='password'
                            placeholder='Mật khẩu'
                            value={loginData.password}
                            onChange={handleLoginChange}
                        />
                        <Components.Anchor href='#'>Quên mật khẩu?</Components.Anchor>
                        <Components.Button type="submit">Đăng Nhập</Components.Button>
                    </Components.Form>
                </Components.LoginContainer>

                {/* Thông báo lỗi */}
                {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}

                <Components.OverlayContainer $signinIn={signIn}>
                    <Components.Overlay $signinIn={signIn}>
                        <Components.LeftOverlayPanel $signinIn={signIn}>
                            <Components.Greeting>Chào mừng trở lại!</Components.Greeting>
                            <Components.Paragraph>
                                Để giữ liên lạc với chúng tôi, vui lòng đăng nhập bằng thông tin cá nhân của bạn
                            </Components.Paragraph>
                            <Components.GhostButton onClick={() => setSignIn(true)}>
                                Đăng Nhập
                            </Components.GhostButton>
                        </Components.LeftOverlayPanel>

                        <Components.RightOverlayPanel $signinIn={signIn}>
                            <Components.Greeting>Xin chào, bạn!</Components.Greeting>
                            <Components.Paragraph>
                                Nhập thông tin cá nhân của bạn và bắt đầu hành trình cùng chúng tôi
                            </Components.Paragraph>
                            <Components.GhostButton onClick={() => setSignIn(false)}>
                                Đăng Ký
                                <i className="lni lni-arrow-right register"></i>
                            </Components.GhostButton>
                        </Components.RightOverlayPanel>
                    </Components.Overlay>
                </Components.OverlayContainer>
            </Components.MidContainer>
        </Components.Section>
    );
};

export default AuthPage;
