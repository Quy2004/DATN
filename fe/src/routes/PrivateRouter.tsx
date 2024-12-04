import { Button } from "antd";
import React from "react";
import { Link, Outlet } from "react-router-dom";

const PrivateRouter = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  console.log("User:", user); 
  if (user && user?.role === "admin")
    // ktra theo role
    return <Outlet />; 
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-red-100 to-pink-200">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center border border-red-300">
          <h2 className="text-3xl font-extrabold text-red-600 mb-4">
            404
          </h2>
          <p className="text-gray-700 mb-6">Vui lòng đăng nhập để tiếp tục.</p>
          <Link to={`/login`} className="inline-block">
            <Button
              type="primary"
              className="bg-red-500 hover:bg-red-600 text-white w-full"
            >
              Đăng nhập
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default PrivateRouter;