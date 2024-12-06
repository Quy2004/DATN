import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import instance from "../../services/api";
import { Order } from "../../types/order";
import toast from "react-hot-toast";

const OderHistory = () => {
  const [filteredOrders, setFilteredOrders] = useState<any>([]);
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
    "Chờ xác nhận",
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

  const handleCancelOrder = async (orderId: number | string) => {
    const reason = prompt("Vui lòng nhập lý do hủy đơn hàng (tùy chọn):", "Thay đổi ý định.");
    if (reason === null) return;

    const confirmCancel = window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?");
    if (!confirmCancel) return;

    try {
      const response = await instance.put(
        `orders/cancel/${orderId}`,
        { reason }
      );

      console.log("Response trả về từ API: ", response.data); // Kiểm tra phản hồi từ API

      if (response.data && response.data.success) {
        // Cập nhật trạng thái của đơn hàng trong UI khi hủy
        setOrderHistory((prevOrders: any) =>
          prevOrders.map((order: Order) =>
            order._id === orderId ? { ...order, orderStatus: "canceled" } : order
          )
        );
        toast.success("Đơn hàng đã bị hủy!");
        getOrderHistory();
      } else {
        toast.error("Có lỗi xảy ra khi hủy đơn hàng.");
      }
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      toast.error("Lỗi khi hủy đơn hàng.");
    }
  };

  useEffect(() => {
    getOrderHistory();
  }, []);

  useEffect(() => {
    if (activeTab === "Tất cả") {
      setFilteredOrders(orderHistory);
    } else {
      const filtered = orderHistory.filter((order: Order) => getStatusString(order?.orderStatus) === activeTab);
      setFilteredOrders(filtered);
    }
  }, [activeTab, orderHistory]);
  return (
    <section className="bg-gray-100">
      <div className="containerAll h-full mt-[60px] mx-auto py-5 *:bg-white">
        <div className="">
          <ul className="flex shadow-md font-[500] overflow-x-auto scrollbar-hide whitespace-nowrap">
            {tabs.map((tab) => (
              <li
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${activeTab === tab
                  ? "border-b-2 border-red-500 text-red-500 py-3 px-[35.3px] w-full text-center md:text-base text-sm"
                  : "py-3 px-[35.3px] w-26 md:w-full text-center md:text-base text-sm"
                  }`}
              >
                {tab}
              </li>
            ))}
          </ul>
        </div>
        <div className="my-3">
          <input
            type="search"
            className="w-full bg-gray-200 border-[#ccc] rounded-sm text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            placeholder="Bạn có thể tìm kiếm theo tên sản phẩm"
          />
        </div>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order: any, index: number) => (
            <div key={index} className="shadow-md rounded-b-lg border-[1px] mb-1">
              <div className="flex justify-end items-center mx-3 my-1 md:m-3">
                <p className="text-sky-500 flex items-center"></p>
                <p className="text-xs mx-2 text-gray-600 md:text-base">
                  Mã đơn: {order?.orderNumber}
                </p>
                <div className="mx-2 text-[#d3d3d3] font-thin">|</div>
                <h2 className="text-xs text-red-600 font-medium md:text-sm">
                  {getStatusString(order?.orderStatus)}
                </h2>
              </div>
              <div className="mx-3 border-t-2 border-gray-200 pt-3 pb-10">
                <div className="mx-3">
                  {order.orderDetail_id.map((item: any, index: number) => (
                    <div className={`flex justify-between mb-2 ${index > 0 ? 'ml-4 text-sm' : ''}`} key={index}>
                      <div className="flex gap-x-3">
                        <img
                          src={item?.product_id?.image}
                          alt="Ảnh sp"
                          className={`w-[65px] h-16 border-[1px] object-cover ${index > 0 ? 'w-[48px] h-[50px] object-cover' : ''}`}
                        />
                        <div>
                          <p className="text-sm md:text-lg">{item.product_id.name}</p>
                          <p className="text-xs md:text-[14px] text-gray-500">Phân loại: {item.size || item.product_size?.name}</p>
                          <p className="text-xs md:text-[14px] text-gray-500">Topping: {item.product_toppings?.map((topping: { topping_id: { nameTopping: any; }; }) => topping.topping_id.nameTopping).join(", ")}</p>
                          {order?.orderStatus === 'canceled' && order.orderDetail_id.length > 1 && (
                            <div className="my-2">
                              <Link
                                key={item.product_id._id} // Sử dụng ID sản phẩm làm key cho mỗi link
                                to={`/detail/${item.product_id._id}`} // Điều hướng đến chi tiết sản phẩm
                                className="md:text-base text-xs font-medium text-red-500 border border-red-500 p-1 rounded-sm"
                              >
                                Mua lại
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs md:text-sm">{formatNumberVND(item?.product_id?.price)}</p>
                        <p className="text-xs md:text-sm">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="*:flex *:justify-end gap-x-2 shadow-md border-t py-6">
                <div className="gap-x-2">
                  <p className="md:text-base text-sm">Thành tiền:</p>
                  <div className="flex text-red-500 mr-3">
                    <p className="text-lg md:text-2xl">{formatNumberVND(order?.totalPrice)}</p>
                  </div>
                </div>
                <div className="py-2 mx-3">
                  {order?.orderStatus === 'pending' && order ? (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="bg-red-600 md:text-base text-sm text-white w-28 md:w-40 rounded text-center py-2"
                    >
                      Yêu cầu hủy
                    </button>
                  ) : order?.orderStatus === 'canceled' && order.orderDetail_id.length < 2 ? (
                    <button
                      
                      className="bg-green-600 md:text-base text-sm text-white w-28 md:w-40 rounded text-center py-2"
                    >
                      Mua lại
                    </button>
                  ) : (
                    <>
                      <div className="">
                        {order?.orderStatus !== 'canceled' && (
                          <div>
                            <Link to={''}>Đã nhận được hàng</Link> <br />
                            <Link to={`/order-tracking/${order?._id}`}>
                              <button
                                className="md:text-base text-sm w-28 md:w-40 rounded text-center py-2 bg-blue-600 text-white"
                              >
                                Theo dõi đơn hàng
                              </button>
                            </Link>
                          </div>
                          )}
                          </div>
                        </>
                      )}
    
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="">Không có đơn hàng nào.</p>
            )}
          </div>
        </section>
      );
};
export default OderHistory;