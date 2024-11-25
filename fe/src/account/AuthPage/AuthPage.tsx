import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
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
    const navigate = useNavigate();

    // Kiểm tra nếu có dữ liệu người dùng trong localStorage để tự động đăng nhập
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setSignIn(false); // Nếu đã có token, chuyển sang trạng thái đã đăng nhập
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
        try {
            const response = await instance.post("/auth/register", registerData);
            toast.success("Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.", {
                duration: 3000,
            });

            localStorage.setItem("user", JSON.stringify(response.data.user));
            localStorage.setItem("token", response.data.token);

            setSignIn(true);
            setRegisterData({ userName: "", email: "", password: "" });
        } catch (error) {
            toast.error("Có lỗi xảy ra khi đăng ký.", { duration: 3000 });
        }
    };

    const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await instance.post("/auth/login", loginData);
            toast.success("Đăng nhập thành công! Chào mừng bạn trở lại.", {
                duration: 2000,
            });

            localStorage.setItem("user", JSON.stringify(response.data.user));
            localStorage.setItem("token", response.data.token);

            setTimeout(() => {

                navigate("/");
                window.location.reload();
            }, 1500);
        } catch (error) {
            toast.error("Email hoặc mật khẩu không chính xác.", { duration: 3000 });
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
                            <Components.Input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={registerData.email}
                                onChange={handleRegisterChange}
                            />
                            <Components.Input
                                type="password"
                                name="password"
                                placeholder="Mật khẩu"
                                value={registerData.password}
                                onChange={handleRegisterChange}
                            />
                            <Components.Button type="submit">Đăng Ký</Components.Button>
                        </Components.Form>
                    </Components.RegisterContainer>

                    <Components.LoginContainer $signinIn={signIn}>
                        <Components.Form onSubmit={handleLoginSubmit}>
                            <Components.Title>Đăng Nhập</Components.Title>
                            <Components.Input
                                type="email"
                                name="email"
                                placeholder="Email / Số điện thoại"
                                value={loginData.email}
                                onChange={handleLoginChange}
                            />
                            <Components.Input
                                type="password"
                                name="password"
                                placeholder="Mật khẩu"
                                value={loginData.password}
                                onChange={handleLoginChange}
                            />
                            <Components.Anchor href="#">Quên mật khẩu?</Components.Anchor>
                            <Components.Button type="submit">Đăng Nhập</Components.Button>
                        </Components.Form>
                    </Components.LoginContainer>

                    <Components.OverlayContainer $signinIn={signIn}>
                        <Components.Overlay $signinIn={signIn}>
                            <Components.LeftOverlayPanel $signinIn={signIn}>
                                <Components.Greeting>Chào mừng trở lại!</Components.Greeting>
                                <Components.Paragraph>
                                    Để giữ liên lạc với chúng tôi, vui lòng đăng nhập bằng thông tin
                                    cá nhân của bạn.
                                </Components.Paragraph>
                                <Components.GhostButton onClick={() => setSignIn(true)}>
                                    Đăng Nhập
                                </Components.GhostButton>
                            </Components.LeftOverlayPanel>

                            <Components.RightOverlayPanel $signinIn={signIn}>
                                <Components.Greeting>Xin chào, bạn!</Components.Greeting>
                                <Components.Paragraph>
                                    Nhập thông tin cá nhân của bạn và bắt đầu hành trình cùng chúng
                                    tôi.
                                </Components.Paragraph>
                                <Components.GhostButton onClick={() => setSignIn(false)}>
                                    Đăng Ký
                                    <i className="lni lni-arrow-right register"></i>
                                </Components.GhostButton>
                            </Components.RightOverlayPanel>
                        </Components.Overlay>
                    </Components.OverlayContainer>

                    {/* Nút Đăng Xuất */}
                    {!signIn && (
                        <Components.Button onClick={handleLogout}>Đăng Xuất</Components.Button>
                    )}
                </Components.MidContainer>
            </Components.Section>
            <Components.NavMobile className="md:hidden">
                <main className="relative mt-20 mb-10 mx-auto z-50 w-[350px] h-[500px] overflow-hidden rounded-lg bg-[url('src/account/AuthPage/Bg-coffee.jpg')] bg-cover bg-no-repeat">
                    <input type="checkbox" id="chk" aria-hidden="true" className="hidden" />
                    <div className="register relative w-full h-full ">
                        <form action="" onSubmit={handleRegisterSubmit}>
                            <label htmlFor="chk" aria-hidden="true" className="flex justify-center m-[60px] text-[#fff] text-[25px] font-bold cursor-pointer transition ease-in-out duration-700 ">Đăng ký</label>
                            <input type="text" name="userName" placeholder="Tên người dùng" value={registerData.userName} onChange={handleRegisterChange}
                                className="w-[70%] h-[40px] bg-[#eee] flex justify-center mx-auto my-3 p-[10px] border-none outline-none rounded" />
                            <input type="email" name="email" placeholder="Email" value={registerData.email} onChange={handleRegisterChange}
                                className="w-[70%] h-[40px] bg-[#eee] flex justify-center mx-auto my-3 p-[10px] border-none outline-none rounded" />
                            <input type="password" name="password" placeholder="Mật khẩu" value={registerData.password} onChange={handleRegisterChange}
                                className="w-[70%] h-[40px] bg-[#eee] flex justify-center mx-auto my-3 p-[10px] border-none outline-none rounded" />
                            <button className="w-[50%] h-[40px] mx-auto my-[10px] block justify-center text-[#fff] bg-[#ea8025] text-[1em] font-bold mt-5 cursor-pointer transition ease-in-out outline-none border-none duration-700">Đăng ký</button>
                        </form>
                    </div>
                    <div className="login h-[460px] bg-[#fff] rounded-custum tranform -translate-y-[180px] transition ease-in-out duration-700 ">
                        <form action="" onSubmit={handleLoginSubmit}>
                            <label htmlFor="chk" aria-hidden="true" className="flex justify-center m-[60px] py-3 text-[25px] font-bold transition ease-in-out duration-700 cursor-pointer">Đăng nhập</label>
                            <input type="email" name="email" placeholder="Email" value={loginData.email} onChange={handleLoginChange}
                                className="w-[70%] h-[40px] bg-[#eee] flex justify-center mx-auto my-3 p-[10px] border-none outline-none rounded" />
                            <input type="password" name="password" placeholder="Mật khẩu" value={loginData.password} onChange={handleLoginChange}
                                className="w-[70%] h-[40px] bg-[#eee] flex justify-center mx-auto my-3 p-[10px] border-none outline-none rounded" />
                            <button className="w-[50%] h-[40px] mx-auto my-[10px] block justify-center text-[#fff] bg-[#ea8025] text-[1em] font-bold mt-5 cursor-pointer transition ease-in-out outline-none border-none duration-700">Đăng nhập</button>

                        </form>
                    </div>
                </main>
            </Components.NavMobile>
        </>
    );
};

export default AuthPage;
