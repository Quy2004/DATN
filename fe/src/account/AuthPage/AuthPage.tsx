import React from 'react';
import * as Components from './AuthComponents'; // Adjust the path as necessary

const AuthPage: React.FC = () => {
    const [signIn, toggle] = React.useState<boolean>(true); // Sử dụng kiểu dữ liệu boolean
    return (
        <Components.Section>
            <Components.MidContainer>
                {/* Register */}
                <Components.RegisterContainer $signinIn={signIn}>
                    <Components.Form>
                        <Components.Title>Tạo Tài Khoản</Components.Title>
                        <Components.Input type='text' placeholder='Name' />
                        <Components.Input type='email' placeholder='Email' />
                        <Components.Input type='password' placeholder='Password' />
                        <Components.Button>Đăng Ký</Components.Button>
                    </Components.Form>
                </Components.RegisterContainer>

                {/* Login */}
                <Components.LoginContainer $signinIn={signIn}>
                    <Components.Form>
                        <Components.Title>Đăng Nhập</Components.Title>
                        <Components.Input type='text' placeholder='Email / SDT' />
                        <Components.Input type='password' placeholder='Password' />
                        <Components.Anchor href='#'>Forgot your password?</Components.Anchor>
                        <Components.Button>Đăng Nhập</Components.Button>
                    </Components.Form>
                </Components.LoginContainer>

                <Components.OverlayContainer $signinIn={signIn}>
                    <Components.Overlay $signinIn={signIn}>
                        <Components.LeftOverlayPanel $signinIn={signIn}>
                            <Components.Greeting>Chào mừng trở lại !</Components.Greeting>
                            <Components.Paragraph>
                                Để giữ liên lạc với chúng tôi, vui lòng đăng nhập bằng thông tin cá nhân của bạn
                            </Components.Paragraph>
                            <Components.GhostButton onClick={() => toggle(true)}>
                                Đăng Nhập
                            </Components.GhostButton>
                        </Components.LeftOverlayPanel>

                        <Components.RightOverlayPanel $signinIn={signIn}>
                            <Components.Greeting>Xin chào, bạn !</Components.Greeting>
                            <Components.Paragraph>
                                Nhập thông tin cá nhân của bạn và bắt đầu hành trình cùng chúng tôi
                            </Components.Paragraph>
                            <Components.GhostButton onClick={() => toggle(false)}>
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