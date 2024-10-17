import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom"; // Import useLocation
import { logo_Cozy } from "../../assets/img";
import {
  FaList,
  FaBoxOpen,
  FaShoppingCart,
  FaComments,
  FaUser,
  FaImage,
  FaChartBar,
  FaRulerCombined,
  FaIceCream,
  FaTags,
} from "react-icons/fa"; // Import icons
import { Button } from "antd";
import { BackwardFilled } from "@ant-design/icons"; // Import icons

const AdminLayout = () => {
  const [dateTime, setDateTime] = useState("");
  const location = useLocation(); // Use useLocation to get the current route

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const dayNames = [
        "Chủ Nhật",
        "Thứ Hai",
        "Thứ Ba",
        "Thứ Tư",
        "Thứ Năm",
        "Thứ Sáu",
        "Thứ Bảy",
      ];
      const day = dayNames[now.getDay()];
      const date = now.getDate().toString().padStart(2, "0");
      const month = (now.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-indexed
      const year = now.getFullYear();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");

      const currentTime = `${day}, ${date}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
      setDateTime(currentTime);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const [activeTab, setActiveTab] = useState("Tất cả");

  const tabs = [
    { name: "Thống kê", link: "", icon: <FaChartBar /> },
    { name: "Quản lí danh mục", link: "category", icon: <FaList /> },
    { name: "Quản lí size", link: "size", icon: <FaRulerCombined /> },
    { name: "Quản lí topping", link: "topping", icon: <FaIceCream /> },
    { name: "Quản lí sản phẩm", link: "product", icon: <FaBoxOpen /> },
    { name: "Quản lí voucher", link: "voucher", icon: <FaTags /> },
    { name: "Quản lí đơn hàng", link: "order", icon: <FaShoppingCart /> },
    { name: "Quản lí bình luận", link: "comment", icon: <FaComments /> },
    { name: "Quản lí tài khoản", link: "client", icon: <FaUser /> },
    { name: "Quản lí banner", link: "banner", icon: <FaImage /> },
  ];

  // Determine breadcrumb based on current route
  const getBreadcrumb = () => {
    if (location.pathname.includes("product")) {
      return "Quản lý sản phẩm ";
    } else if (location.pathname.includes("category")) {
      return "Quản lý danh mục ";
    } else if (location.pathname.includes("size")) {
      return "Quản lý size ";
    } else if (location.pathname.includes("topping")) {
      return "Quản lý topping ";
    } else if (location.pathname.includes("voucher")) {
      return "Quản lý voucher";
    } else if (location.pathname.includes("order")) {
      return "Quản lý đơn hàng ";
    } else if (location.pathname.includes("comment")) {
      return "Quản lý bình luận ";
    } else if (location.pathname.includes("client")) {
      return "Quản lý tài khoản ";
    } else if (location.pathname.includes("banner")) {
      return "Quản lý banner";
    } else {
      return "Thống kê "; // Default breadcrumb
    }
  };

  return (
    <>
      <div className="flex w-full">
        <aside className="sidebar p-[20px] w-[250px] h-[900px] bg-[#33418E]">
          <div className="logo mb-[50px] w-full *:mx-auto text-center">
            <img
              className="w-[90x] h-[90px] rounded-[50%]"
              src={logo_Cozy}
              alt="The Coffee House"
            />
            <p className="mt-[15px] text-white font-semibold">
              ADMIN - COZYHAVEN
            </p>
          </div>

          <ul className="list-none p-0 space-y-2">
            {tabs.map((tab) => (
              <li
                key={tab.name}
                className={`${
                  activeTab === tab.name
                    ? "bg-[#AFD4FF] text-black"
                    : "bg-gray-100 text-gray-600"
                } rounded-lg transition duration-300 ease-in-out cursor-pointer hover:bg-[#AFD4FF] hover:text-black text-left`}
                onClick={() => setActiveTab(tab.name)}
              >
                <Link
                  to={tab.link}
                  className={`block px-6 py-3 font-medium text-[15px] flex items-center ${
                    activeTab === tab.name ? "text-black" : "text-gray-600"
                  } transition duration-300 text-left`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <main className="main-content w-full flex-1 p-6 bg-gray-100">
          <div className="flex justify-end">
            <Button type="primary">
              <Link to="/">
                <BackwardFilled /> Quay lại
              </Link>
            </Button>
          </div>

          {/* Header */}
          <div className="breadcrumb flex justify-between items-center bg-white p-4 rounded-lg shadow mb-6 mt-2">
            <span className="text-gray-600 font-medium">{getBreadcrumb()}</span>
            <span className="date-time text-gray-500 text-sm">{dateTime}</span>
          </div>

          {/* Content */}
          <div className="content bg-white p-6 rounded-lg shadow-lg">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminLayout;
