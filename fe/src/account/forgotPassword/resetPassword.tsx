import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import instance from "../../services/api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate(); // Thêm useNavigate
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // Validation
    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Xác nhận mật khẩu không khớp. Vui lòng nhập lại!");
      setLoading(false);
      return;
    }

    try {
      const response = await instance.post("/auth/reset-password", {
        newPassword,
        token,
      });
      setMessage(response.data.message);
      setTimeout(() => {
        navigate("/login"); // Chuyển hướng sau khi đặt lại mật khẩu thành công
      }, 2000); // Đợi 2 giây trước khi chuyển hướng
    } catch (error: any) {
      setError(error.response?.data?.message || "Lỗi khi đặt lại mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-orange-200 flex items-center justify-center px-4 py-8">
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
            className="text-center"
          >
            <div className="flex justify-center mb-4">
              <FaLock className="text-5xl text-blue-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Đặt Lại Mật Khẩu
            </h2>
            <p className="text-gray-500 text-sm">
              Vui lòng nhập mật khẩu mới của bạn
            </p>
          </motion.div>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-gray-700 font-medium mb-2">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg   
                  focus:outline-none focus:ring-2 focus:ring-blue-500   
                  transition duration-300 ease-in-out"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500 transition"
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-gray-700 font-medium mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg   
                  focus:outline-none focus:ring-2 focus:ring-blue-500   
                  transition duration-300 ease-in-out"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500 transition"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </motion.div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-500 flex items-center"
              >
                <span className="mr-2">❌</span> {error}
              </motion.p>
            )}

            {message && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green-500 flex items-center space-x-2 bg-green-50 p-3 rounded-lg"
              >
                <FaCheckCircle />
                <span>{message}</span>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg   
              hover:bg-blue-700 transition duration-300   
              flex items-center justify-center space-x-2  
              disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
              ) : (
                "Đặt Lại Mật Khẩu"
              )}
            </motion.button>
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
              transition duration-300 text-sm"
            >
              <span>Quay lại đăng nhập</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
