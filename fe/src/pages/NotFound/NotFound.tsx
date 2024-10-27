import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="bg-gradient-to-r from-yellow-100 via-orange-100 to-pink-200 h-screen flex flex-col justify-center items-center relative overflow-hidden">
      <div className="absolute top-10 left-0 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>

      <h1 className="text-9xl font-extrabold text-pink-600 drop-shadow-lg">
        404
      </h1>

      <p className="text-2xl md:text-4xl font-semibold text-gray-800 mt-4">
        Oops! Có vẻ như bạn đang đi lạc.
      </p>
      <p className="text-gray-600 text-lg mt-2">
        Dường như bạn đã truy cập vào một trang không tồn tại.
      </p>

      <Link
        to="/"
        className="mt-6 px-8 py-4 text-lg font-medium text-white bg-pink-600 rounded-full shadow-lg hover:shadow-2xl hover:bg-pink-700 transition duration-300 transform hover:scale-105"
      >
        Quay về trang chủ
      </Link>
    </div>
  );
};

export default NotFoundPage;