import { useState } from "react";
import { Link } from "react-router-dom"
import { TooltipArrowButton } from "../../components/TooltipArrow";


const OderHistory = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState("Tất cả");
  const tabs = [
    "Tất cả",
    "Chờ thanh toán",
    "Vận chuyển",
    "Chờ giao hàng",
    "Hoàn thành",
    "Đã hủy",
    "Trả hàng / hoàn tiền"
  ];
  return (
    <>
      <section className="bg-gray-100">
        <div className="containerAll mx-auto py-5 *:bg-white">
          <div className="">
            <ul className="flex shadow-md font-[500]">
              {tabs.map((tab) => (
                <li
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${activeTab === tab ? 'border-b-2 border-red-500 text-red-500' : ''
                    }`}
                >
                  <Link to="" className="block py-3 px-[35.3px] w-full h-full text-center">
                    {tab}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="my-3">
            <input type="search" className="w-full bg-gray-200 border-[#ccc] rounded-sm text-sm  focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" name="" id="" placeholder="Bạn có thể tìm kiếm theo tên sản phẩm" />
          </div>
          <div className="shadow-md rounded-b-lg  border-[1px]">
            <div className="flex justify-end items-center m-3">
              <p className="text-sky-500 flex items-center">
              <TooltipArrowButton />
              </p>
              <div className="mx-2 text-[#d3d3d3] font-thin">|</div>
              <h2 className="text-sm text-red-600 font-medium">HOÀN THÀNH</h2>
            </div>
            <div className="flex justify-between mx-3 border-t-2 border-gray-200 pt-3 pb-10">
              <div className="flex ">
                <img src="Ảnh.jpg" alt="Ảnh sp" className="w-20 h-20 border-[1px]" />
                <div className="mx-3">
                  <p>Prodcuct Cart</p>
                  <span className="flex gap-1">Phân Loại: <p className="text-gray-500">Size XL - Topping : A, B, C, D</p></span>
                  <span>x1</span>
                </div>
              </div>
              <p className="text-sm">33.000 VND</p>
            </div>
          </div>
          <div className="*:flex *:justify-end gap-x-2 shadow-md border-2 py-6">
            <div className="gap-x-2">
              <p>Thành tiền:</p>
              <div className="flex text-red-500 mr-3">
                <p className=" text-2xl">33.000</p><p className="text-xs">VND</p>
              </div>
            </div>
            <div className="py-4 mx-3">
              <Link to={``} className="bg-red-600 text-white w-40 rounded text-center py-2">Mua lại</Link>
              {/* <Link to={``}>Lịch sử đơn mua</Link> */}
            </div>
          </div>
          <div className="mt-3">
            <div className="shadow-md rounded-b-lg  border-[1px]">
              <div className="flex justify-end items-center m-3">
                <p className="text-sky-500 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-5 h-5 mx-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                    />
                  </svg>
                  <Link to="/tracking" className="hover:underline">
                    Đang được giao
                  </Link>
                  <div
                    className="relative ml-1"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-4 h-4 mt-1 text-black"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                      />
                    </svg>
                    {isHovered && (
                      <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 p-2 bg-[#eee] rounded shadow-xl text-center w-40 text-black z-50">
                        <p>Cập Nhật Mới Nhất</p>
                        <p>17:06 09-09-2024</p>
                        {/* Móc tam giác */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 -top-2 w-0 h-0 border-l-8 border-r-8 border-b-8  border-transparent border-b-[#eee]"></div>
                      </div>
                    )}
                  </div>
                </p>
                <div className="mx-2 text-[#d3d3d3] font-thin">|</div>
                <h2 className="text-sm text-red-600 font-medium">HOÀN THÀNH</h2>
              </div>
              <div className="flex justify-between mx-3 border-t-2 border-gray-200 pt-3 pb-10">
                <div className="flex ">
                  <img src="Ảnh.jpg" alt="Ảnh sp" className="w-20 h-20 border-[1px]" />
                  <div className="mx-3">
                    <p>Prodcuct Cart</p>
                    <span className="flex gap-1">Phân Loại: <p className="text-gray-500">Size XL - Topping : A, B, C, D</p></span>
                    <span>x1</span>
                  </div>
                </div>
                <p className="text-sm">33.000 VND</p>
              </div>
            </div>
            <div className="*:flex *:justify-end gap-x-2 shadow-md border-2 py-6">
              <div className="gap-x-2">
                <p>Thành tiền:</p>
                <div className="flex text-red-500 mr-3">
                  <p className=" text-2xl">33.000</p><p className="text-xs">VND</p>
                </div>
              </div>
              <div className="py-4 mx-3">
                <Link to={``} className="bg-red-600 text-white w-40 rounded text-center py-2">Hủy đơn hàng</Link>
                {/* <Link to={``}>Lịch sử đơn mua</Link> */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
export default OderHistory