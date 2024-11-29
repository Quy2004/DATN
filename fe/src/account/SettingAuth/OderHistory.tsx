import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import instance from "../../services/api";

const OderHistory = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [orderHistory, setOrderHistory] = useState<any>([]);
  const userId = JSON.parse(localStorage.getItem("user") || "{}")._id;
  const formatNumberVND = (number: number) => {
    return number.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  };
  const getOrderHistory = async () => {
    try {
      const response = await instance.get(`/orders/${userId}`);
      setOrderHistory(response?.data?.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    getOrderHistory();
  }, []);
  const tabs = [
    "Tất cả",
    "Chờ thanh toán",
    "Vận chuyển",
    "Chờ giao hàng",
    "Hoàn thành",
    "Đã hủy",
    "Trả hàng / hoàn tiền",
  ];
  const getStatusString = (status: string): string => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận"; 
      case "confirmed":
        return "Đã xác nhận";
      case "shipping":
        return "Đang giao hàng"; 
      case "delivered":
        return "Đã giao hàng"; 
      case "completed":
        return "Đã hoàn thành";
      case "canceled":
        return "Đã hủy"; 
      default:
        return "Trạng thái không xác định"; 
    }
  };
  
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
                  className={`${activeTab === tab
                      ? "border-b-2 border-red-500 text-red-500"
                      : ""
                    }`}
                >
                  <Link
                    to=""
                    className="block py-3 px-[35.3px] w-full h-full text-center"
                  >
                    {tab}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="my-3">
            <input
              type="search"
              className="w-full bg-gray-200 border-[#ccc] rounded-sm text-sm  focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              name=""
              id=""
              placeholder="Bạn có thể tìm kiếm theo tên sản phẩm"
            />
          </div>
          {orderHistory?.map((order: any , index: number) => (
            <>
              <div key={index} className="shadow-md rounded-b-lg  border-[1px]">
                <div className="flex justify-end items-center m-3">
                  <p className="text-sky-500 flex items-center">
                    {/* <TooltipArrowButton /> */}
                  </p>
                  <p className="mx-2 text-gray-600">
                    Mã đơn: {order?.orderNumber}
                  </p>
                  <div className="mx-2 text-[#d3d3d3] font-thin">|</div>
                  <h2 className="text-sm text-red-600 font-medium">
                    {getStatusString(order?.orderStatus)}
                  </h2>
                </div>
                <div className="flex justify-between mx-3 border-t-2 border-gray-200 pt-3 pb-10">
                  <div className="flex ">
                    <img
                      src={order?.orderDetail_id[0]?.product_id?.image}
                      alt="Ảnh sp"
                      className="w-20 h-20 border-[1px]"
                    />
                    <div className="mx-3">
                      <p>{order?.orderDetail_id[0]?.product_id?.name}</p>
                      {order?.orderDetail_id?.[0]?.size ||
                        order?.orderDetail_id?.[0]?.product_size?.name ? (
                        <span className="flex gap-1">
                          Phân Loại:{" "}
                          <p className="text-gray-500">
                            {order?.orderDetail_id?.[0]?.size ??
                              `Size: ${order?.orderDetail_id?.[0]?.product_size?.name}`}
                          </p>
                        </span>
                      ) : null}
                      {order?.orderDetail_id?.[0]?.product_toppings?.[0]
                        ?.topping_id?.nameTopping ? (
                        <span className="flex gap-1">
                          Toppings:{" "}
                          {
                            order?.orderDetail_id?.[0]?.product_toppings[0]
                              .topping_id?.nameTopping
                          }
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          Không có toppings kèm theo
                        </span>
                      )}
                      <span>x {order?.orderDetail_id[0]?.quantity}</span>
                    </div>
                  </div>
                  <p className="text-sm">{formatNumberVND(order?.orderDetail_id[0]?.product_id?.price)}</p>
                </div>
              </div>
              <div className="*:flex *:justify-end gap-x-2 shadow-md border-2 py-6">
                <div className="gap-x-2">
                  <p>Thành tiền:</p>
                  <div className="flex text-red-500 mr-3">
                    <p className=" text-2xl">{formatNumberVND(order?.totalPrice)}</p>
                  </div>
                </div>
                <div className="py-2 mx-3">
                  {order?.orderStatus === 'pending' ? (
                    <>
                    <Link
                    to={``}
                    className="bg-red-600 text-white w-40 rounded text-center py-2"
                  >
                    Yêu cầu hủy
                  </Link>
                    </>
                  ): (
                    <>
                    <Link
                    to={``}
                    className="bg-gray-400 text-white font-nomal w-40 rounded text-center py-2"
                  >
                    Đã nhận được hàng
                  </Link>
                    </>
                  ) }
                </div>
                <div className="py-2 mx-3">
                <Link
                    to={`/order-tracking/${order?._id}`}
                    className="bg-blue-600 text-white font-nomal w-40 rounded text-center py-2"
                  >
                    Theo dõi đơn hàng
                  </Link>
                </div>
              </div>
            </>
          ))}
        </div>
      </section>
    </>
  );
};
export default OderHistory;