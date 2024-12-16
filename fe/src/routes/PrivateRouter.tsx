import { Outlet, useNavigate } from "react-router-dom";
import instance from "../services/api";
import toast from "react-hot-toast";
import { useState } from "react";
import { HiEye, HiEyeOff, HiMail } from "react-icons/hi";

const PrivateRouter = () => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (user && user.role === "admin") {
    return <Outlet />;
  }

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await instance.post("/auth/login", loginData);
      toast.success("Đăng nhập thành công!", {
        duration: 2000,
      });

      setTimeout(() => {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/admin");
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast.error("Email hoặc mật khẩu không chính xác.", { duration: 3000 });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-6 flex flex-col justify-center sm:py-12 relative">
      <div className="relative px-4 py-10 sm:rounded-3xl sm:p-20">
        <div className="max-w-md mx-auto">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 space-y-8 border border-gray-100">
            <div className="text-center space-y-4">
              <div className="inline-block p-4 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  ></path>
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800">COZY HAVEN</h2>
              <p className="text-gray-500 text-sm">Admin Dashboard Login</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
placeholder="admin@example.com"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                  />
                  <HiMail className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 bg-white/50 backdrop-blur-sm placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <HiEyeOff className="w-5 h-5" />
                    ) : (
                      <HiEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-0.5 ${
                  isLoading
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:from-indigo-700 hover:to-purple-700"
                }`}
              >
                {isLoading ? "Signing in..." : "Sign in to Dashboard"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateRouter;