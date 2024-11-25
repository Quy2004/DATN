import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleContinueShopping = () => {
    navigate("/");
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-teal-200 via-pink-200 to-yellow-200 p-4 sm:p-6">
      <div className="absolute inset-0 bg-opacity-30 bg-gradient-to-r from-teal-200 via-pink-200 to-yellow-200"></div>{" "}
      {/* Nền gradient mờ */}
      <div className="relative z-10 bg-white p-6 sm:p-8 rounded-lg shadow-lg text-center transform transition-all duration-500 scale-95 hover:scale-100">
        <div className="flex justify-center items-center mb-6">
          <div className="bg-green-100 text-green-500 rounded-full p-4 animate-bounce">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">
          Cảm ơn bạn đã mua hàng
        </h1>
        <p className="text-sm text-gray-700 mb-6 ">
          Chúng tôi hy vọng bạn sẽ tận hưởng hương vị
          tuyệt vời!
          <br />
        </p>
        <button
          className="bg-[#ea8025] text-white font-bold py-2 px-4 rounded-lg  transition-colors duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:shadow-outline"
          onClick={handleContinueShopping}
        >
          Tiếp tục mua sắm
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;
