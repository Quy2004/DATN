import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import instance from "../../services/api";
import Swal from "sweetalert2";

const Forgot = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setLoading(true);

    try {
      const response = await instance.post("/auth/forgot-password", { email });
      setMessage(response.data.message);
      setIsError(false);
      Swal.fire({
        title: "Thành công!",
        text: "Email đã được gửi thành công.",
        icon: "success",  
      });
      setTimeout(() => {
        navigate("/login");
      }, 4000
    )     
      
    } catch (error: unknown) {
      Swal.fire({
        title: "Thành công!",
        text: "Email đã được gửi thành công.",
        icon: "success",
      });

      setTimeout(() => {
        navigate("/login");
      }, 4000
    )
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-200 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden"
      >
        <div className="p-8 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <FaEnvelope className="mr-3 text-blue-500" />
              Quên Mật Khẩu
            </h1>
            <p className="text-gray-500 text-sm">
              Nhập email để khôi phục mật khẩu của bạn
            </p>
          </motion.div>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-gray-700 font-medium mb-2">
                Địa chỉ Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg   
                  focus:outline-none focus:ring-2 focus:ring-blue-500   
                  transition duration-300 ease-in-out"
                  required
                />
                <FaEnvelope className="absolute right-4 top-4 text-gray-400" />
              </div>
            </motion.div>

            {message && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-sm text-center ${
                  isError ? "text-red-500" : "text-green-500"
                }`}
              >
                {message}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-between items-center"
            >
              <button
                type="submit"
                disabled={!email || loading}
                className="w-full bg-blue-500 text-white py-3 rounded-lg   
                hover:bg-blue-600 transition duration-300   
                flex items-center justify-center space-x-2  
                disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                ) : (
                  "Gửi Yêu Cầu"
                )}
              </button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <Link
              to="/login"
              className="text-blue-500 hover:text-blue-700   
              flex items-center justify-center space-x-2   
              transition duration-300"
            >
              <FaArrowLeft />
              <span>Quay lại đăng nhập</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Forgot;
