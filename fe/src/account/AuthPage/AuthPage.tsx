import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import * as Components from "./AuthComponents";
import instance from "../../services/api";
import { useNavigate } from "react-router-dom";

interface RegisterData {
    userName: string;
    email: string;
    password: string;
}

interface LoginData {
    email: string;
    password: string;
}

const AuthPage = () => {
    const [signIn, setSignIn] = useState(true);
    const [registerData, setRegisterData] = useState<RegisterData>({
        userName: "",
        email: "",
        password: "",
    });
    const [loginData, setLoginData] = useState<LoginData>({
        email: "",
        password: "",
    });

    // Khai báo state để lưu trữ lỗi
    const [registerErrors, setRegisterErrors] = useState<{ [key: string]: string }>({});
    const [loginErrors, setLoginErrors] = useState<{ [key: string]: string }>({});
    
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setSignIn(false); // Nếu có token, chuyển sang trạng thái đã đăng nhập
        }
    }, []);

    const handleRegisterChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRegisterData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLoginChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLoginData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        // Xóa lỗi cũ trước khi kiểm tra mới
        setRegisterErrors({});
    
        const errors: { [key: string]: string } = {};
    
        if (!registerData.userName.trim()) {
            errors.userName = "Tên người dùng không được để trống.";
        }
    
        if (!registerData.email.trim()) {
            errors.email = "Email không được để trống.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
            errors.email = "Email không hợp lệ.";
        }
    
        if (!registerData.password) {
            errors.password = "Mật khẩu không được để trống.";
        } else if (registerData.password.length < 6) {
            errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
        }
    
        if (Object.keys(errors).length > 0) {
            setRegisterErrors(errors); // Cập nhật lỗi vào state
            toast.error("Vui lòng kiểm tra lại thông tin đăng ký.", { duration: 3000 });
            return;
        }
    
        try {
            // Kiểm tra email đã tồn tại hay chưa
            const emailExistsResponse = await instance.get(`/auth/check-email/${registerData.email}`);
            if (emailExistsResponse.data.exists) {
                setRegisterErrors({ email: "Email này đã được đăng ký." });         
                return;
            }
    
            // Tiến hành đăng ký nếu email chưa tồn tại
            const response = await instance.post("/auth/register", registerData);
            if (response.data && response.data.data) {
                toast.success("Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.", { duration: 3000 });
                localStorage.setItem("user", JSON.stringify(response.data.data));
                setSignIn(true);
                setRegisterData({ userName: "", email: "", password: "" });
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Xóa lỗi cũ trước khi kiểm tra mới
        setLoginErrors({});

        const errors: { [key: string]: string } = {};

        if (!loginData.email.trim()) {
            errors.email = "Email không được để trống.";
        }

        if (!loginData.password) {
            errors.password = "Mật khẩu không được để trống.";
        }

        if (Object.keys(errors).length > 0) {
            setLoginErrors(errors); // Cập nhật lỗi vào state
            toast.error("Vui lòng kiểm tra lại thông tin đăng nhập.", { duration: 3000 });
            return;
        }

        try {
            const response = await instance.post("/auth/login", loginData);
            if (response.data && response.data.user && response.data.token) {
                toast.success("Đăng nhập thành công! Chào mừng bạn trở lại.", { duration: 2000 });
                localStorage.setItem("user", JSON.stringify(response.data.user));
                localStorage.setItem("token", response.data.token);
                instance.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
                setTimeout(() => {
                    navigate("/");
                    window.location.reload();
                }, 1500);
            }
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || "Email hoặc mật khẩu không chính xác.";
            toast.error(errorMessage, { duration: 3000 });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        toast.success("Đã đăng xuất thành công!", { duration: 2000 });
        navigate("/login");
        setSignIn(true); // Cập nhật trạng thái để hiện form đăng nhập
    };

    return (
        <>
            <Components.Section className="hidden md:block">
    <Components.MidContainer>
        <Components.RegisterContainer $signinIn={signIn}>
            <Components.Form onSubmit={handleRegisterSubmit}>
                <Components.Title>Tạo Tài Khoản</Components.Title>
                
                <Components.Input
                    type="text"
                    name="userName"
                    placeholder="Tên người dùng"
                    value={registerData.userName}
                    onChange={handleRegisterChange}
                />
                {registerErrors.userName && (
                    <p className="text-red-500">{registerErrors.userName}</p>
                )}
                
                <Components.Input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                />
                {registerErrors.email && (
                    <p className="text-red-500">{registerErrors.email}</p>
                )}
                
                <Components.Input
                    type="password"
                    name="password"
                    placeholder="Mật khẩu"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                />
                {registerErrors.password && (
                    <p className="text-red-500">{registerErrors.password}</p>
                )}
                
                <Components.Button type="submit">Đăng Ký</Components.Button>
            </Components.Form>
        </Components.RegisterContainer>
        
        {/* Đoạn mã đăng nhập không thay đổi */}
        <Components.LoginContainer $signinIn={signIn}>
            <Components.Form onSubmit={handleLoginSubmit}>
                <Components.Title>Đăng Nhập</Components.Title>
                <Components.Input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                />
                {loginErrors.email && (
                    <p className="text-red-500">{loginErrors.email}</p>
                )}
                <Components.Input
                    type="password"
                    name="password"
                    placeholder="Mật khẩu"
                    value={loginData.password}
                    onChange={handleLoginChange}
                />
                {loginErrors.password && (
                    <p className="text-red-500">{loginErrors.password}</p>
                )}
                <Link className="my-5 hover:text-blue-700" to="/forgot">Quên mật khẩu?</Link>
                <Components.Button type="submit">Đăng Nhập</Components.Button>
            </Components.Form>
        </Components.LoginContainer>
        
        {/* Đoạn mã Overlay không thay đổi */}
        <Components.OverlayContainer $signinIn={signIn}>
            <Components.Overlay $signinIn={signIn}>
                <Components.LeftOverlayPanel $signinIn={signIn}>
                    <Components.Greeting>Chào mừng trở lại!</Components.Greeting>
                    <Components.Paragraph>
                        Để giữ liên lạc với chúng tôi, vui lòng đăng nhập bằng thông tin
                        cá nhân của bạn.
                    </Components.Paragraph>
                    <Components.GhostButton onClick={() => setSignIn(true)}>
                        Đăng Ký
                    </Components.GhostButton>
                </Components.LeftOverlayPanel>
                <Components.RightOverlayPanel $signinIn={signIn}>
                    <Components.Greeting>Chào bạn!</Components.Greeting>
                    <Components.Paragraph>
                        Nếu bạn chưa có tài khoản, vui lòng đăng ký để bắt đầu.
                    </Components.Paragraph>
                    <Components.GhostButton onClick={() => setSignIn(false)}>
                        Đăng Nhập
                    </Components.GhostButton>
                </Components.RightOverlayPanel>
            </Components.Overlay>
        </Components.OverlayContainer>
    </Components.MidContainer>
</Components.Section>

        </>
    );
};

export default AuthPage;
