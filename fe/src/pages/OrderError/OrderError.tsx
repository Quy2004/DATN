import React from "react";
import { useNavigate } from "react-router-dom";

const OrderErr: React.FC = () => {
  const navigate = useNavigate();

  const handleContinueShopping = () => {
    navigate("/");
  };

  return (
    <div className="mt-20 md:mt-0 relative flex flex-col items-center justify-center md:min-h-screen bg-gradient-to-r from-gray-200 via-red-200 to-red-400 p-4 sm:p-6 ">
      <div className="absolute inset-0 bg-opacity-30 bg-gradient-to-r from-gray-200 via-red-200 to-red-400"></div>
      {/* Nền gradient mờ */}
      <div className="relative z-10 bg-white p-6 sm:p-8 rounded-lg shadow-lg text-center transform transition-all duration-500 scale-95 hover:scale-100">
        <div className="flex justify-center items-center mb-6">
          <div className="bg-red-100 text-red-500 rounded-full p-4 animate-pulse">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M19 12c0 3.866-3.582 7-8 7s-8-3.134-8-7 3.582-7 8-7 8 3.134 8 7z"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-red-900">
          Đã xảy ra lỗi khi đặt hàng!
        </h1>
        <p className="text-sm text-gray-700 mb-6">
          Rất tiếc, chúng tôi không thể xử lý đơn hàng của bạn. <br />
          Vui lòng thử lại hoặc liên hệ với bộ phận hỗ trợ khách hàng.
        </p>
        <button
          className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:shadow-outline"
          onClick={handleContinueShopping}
        >
          Tiếp tục mua sắm
        </button>
      </div>
    </div>
  );
};

export default OrderErr;
