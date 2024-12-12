import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import instance from "../../services/api";
import { Order } from "../../types/order";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message, Modal } from "antd";
import { ProductTopping } from "../../types/product";
import Swal from "sweetalert2";

const OderHistory = () => {
  const [filteredOrders, setFilteredOrders] = useState<any>([]);
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [orderHistory, setOrderHistory] = useState<any>([]);
  const userId = JSON.parse(localStorage.getItem("user") || "{}")._id;
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [searchedOrderIds, setSearchedOrderIds] = useState<string[]>([]);
  const [visibleProductsMap, setVisibleProductsMap] = useState<{
    [orderId: string]: number;
  }>({});

  const [messageApi, contextHolder] = message.useMessage();
  const formatNumberVND = (number: number) => {
    return number.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
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
    "Đã xác nhận",
    "Đang giao hàng",
    "Đã giao hàng",
    "Hoàn thành",
    "Đã hủy",
  ];
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipping":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
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
        return "Hoàn thành";
      case "canceled":
        return "Đã hủy";
      default:
        return "Trạng thái không xác định";
    }
  };

  const handleCancelOrder = async (orderId: number | string) => {
    const reasons = [
      "Thay đổi ý định",
      "Tìm thấy giá rẻ hơn",
      "Sự cố thanh toán",
      "Thời gian giao hàng quá lâu",
      "Đặt nhầm sản phẩm",
      "Hàng không đúng mô tả",
      "Khuyến mãi hết hạn",
      "Khác",
    ];

    const { value: formValues } = await Swal.fire({
      title: "Hủy Đơn Hàng",
      html: `
      <style>
        .swal2-container {
          font-family: 'Arial', sans-serif;
        }
        .custom-select {
          width: 100%;
          padding: 8px;
          margin-bottom: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
        }
        .custom-input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
        }
        .custom-label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
      </style>
      <div>
        <label for="reasonSelect" class="custom-label">Chọn lý do hủy:</label>
        <select id="reasonSelect" class="custom-select">
          ${reasons
            .map((reason) => `<option value="${reason}">${reason}</option>`)
            .join("")}
        </select>
        <label for="customReason" class="custom-label">Hoặc nhập lý do khác:</label>
        <input id="customReason" class="custom-input" placeholder="Lý do hủy đơn (tùy chọn)" />
      </div>
    `,
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xác Nhận Hủy",
      cancelButtonText: "Quay Lại",
      preConfirm: () => {
        const reasonSelect = (
          document.getElementById("reasonSelect") as HTMLSelectElement
        ).value;
        const customReason = (
          document.getElementById("customReason") as HTMLInputElement
        ).value;

        return customReason.trim() || reasonSelect;
      },
    });

    if (formValues) {
      const reason = formValues;

      try {
        const response = await instance.put(`orders/cancel/${orderId}`, {
          reason,
        });

        if (response.data && response.data.success) {
          setOrderHistory((prevOrders: any) =>
            prevOrders.map((order: Order) =>
              order._id === orderId
                ? { ...order, orderStatus: "canceled" }
                : order
            )
          );

          Swal.fire({
            title: "Đã Hủy Đơn Hàng!",
            text: "Đơn hàng của bạn đã được hủy thành công.",
            icon: "success",
          });

          getOrderHistory();
        } else {
          Swal.fire({
            title: "Lỗi",
            text: "Có lỗi xảy ra khi hủy đơn hàng.",
            icon: "error",
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Lỗi",
          text: "Không thể hủy đơn hàng. Vui lòng thử lại.",
          icon: "error",
        });
      }
    }
  };

  useEffect(() => {
    getOrderHistory();
  }, []);

  useEffect(() => {
    let filtered = orderHistory;
    if (searchTerm) {
      filtered = filtered.filter((order: Order) =>
        order.orderDetail_id.some((item: any) =>
          item.product_id.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (activeTab !== "Tất cả") {
      filtered = filtered.filter(
        (order: Order) => getStatusString(order?.orderStatus) === activeTab
      );
    }

    setFilteredOrders(filtered);
  }, [searchTerm, activeTab, orderHistory]);

  // Thêm mutation để xác nhận đã nhận hàng
  const confirmDeliveryMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await instance.put(`/orders/status/${orderId}`, {
        status: "completed",
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      messageApi.success("Đã xác nhận nhận hàng thành công!");
      getOrderHistory(); // Refresh lại danh sách đơn hàng
    },
    onError: (error) => {
      messageApi.error(`Có lỗi xảy ra: ${error.message}`);
    },
  });

  // Thêm hàm xử lý xác nhận đã nhận hàng
  const handleConfirmDelivery = (orderId: string) => {
    Modal.confirm({
      title: "Xác nhận đã nhận hàng",
      content: "Bạn có chắc chắn đã nhận được hàng không?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: () => {
        confirmDeliveryMutation.mutate(orderId);
      },
    });
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);

    if (searchValue) {
      const matchingOrderIds = orderHistory
        .filter((order: Order) =>
          order.orderDetail_id.some((item: any) =>
            item.product_id.name
              .toLowerCase()
              .includes(searchValue.toLowerCase())
          )
        )
        .map((order: Order) => order._id);

      setSearchedOrderIds(matchingOrderIds);
    } else {
      setSearchedOrderIds([]);
    }
  };

  const toggleProductVisibility = (orderId: string) => {
    setVisibleProductsMap((prev) => ({
      ...prev,
      [orderId]: (prev[orderId] || 1) + 1,
    }));
  };

  useEffect(() => {
    let filtered = orderHistory;

    if (searchTerm) {
      filtered = filtered.filter((order: Order) =>
        order.orderDetail_id.some((item: any) =>
          item.product_id.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (activeTab !== "Tất cả") {
      filtered = filtered.filter(
        (order: Order) => getStatusString(order?.orderStatus) === activeTab
      );
    }

    setFilteredOrders(filtered);
  }, [searchTerm, activeTab, orderHistory]);

  return (
    <section className="bg-gray-50 min-h-screen">
      {contextHolder}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-[60px]">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <nav className="flex flex-wrap border-b">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
              flex-1 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-medium transition-colors duration-200
              ${
                activeTab === tab
                  ? "border-b-2 border-red-500 text-red-600 bg-red-50/50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }
            `}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="search"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors duration-200"
              placeholder="Tìm kiếm theo mã đơn hàng hoặc Tên sản phẩm"
              value={searchTerm}
              onChange={handleSearchChange}
            />

            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order: Order, index: number) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Order Header */}
                <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-x-4 sm:space-y-0">
                    <span className="text-sm text-gray-600">
                      Mã đơn: {order?.orderNumber}
                    </span>
                    <span className="h-4 w-px bg-gray-300 hidden sm:block"></span>
                    <span
                      className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  ${getStatusColor(order?.orderStatus)}
                `}
                    >
                      {getStatusString(order?.orderStatus)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-2 sm:mt-0">
                    {new Date(order?.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {/* Order Items */}
                <div className="px-4 sm:px-6 py-4 space-y-4">
                  {order.orderDetail_id.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-x-4 sm:space-y-0"
                    >
                      <img
                        src={item?.product_id?.image}
                        alt={item?.product_id?.name}
                        className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <Link to={`/detail/${item.product_id._id}`}>
                          <h3 className="text-sm font-medium text-gray-900">
                            <a className="text-blue-500 hover:underline">
                              {item.product_id.name}
                            </a>
                          </h3>
                        </Link>

                        <div className="mt-1 text-sm text-gray-500 space-y-1">
                          <p>
                            Size: {item.size || item.product_size?.name}{" "}
                            {item.product_size?.priceSize !== undefined &&
                            item.product_size?.priceSize !== null
                              ? `(${item.product_size.priceSize.toLocaleString(
                                  "vi-VN"
                                )} ₫)`
                              : ""}
                          </p>

                          <p>
                            Topping:{" "}
                            {item.product_toppings?.length > 0
                              ? item.product_toppings
                                  .map(
                                    (topping: ProductTopping) =>
                                      `${
                                        topping.topping_id.nameTopping
                                      } (${topping.topping_id.priceTopping.toLocaleString(
                                        "vi-VN"
                                      )} ₫)`
                                  )
                                  .join(", ")
                              : "Không có topping"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {item?.product_id?.sale_price &&
                        item.product_id.sale_price !== item.product_id.price ? (
                          <>
                            <p className="text-sm font-medium text-red-500">
                              {formatNumberVND(item.product_id.sale_price)}{" "}
                              {/* Giá sale */}
                            </p>
                            <p className="text-sm line-through text-gray-400">
                              {formatNumberVND(item.product_id.price)}{" "}
                              {/* Giá gốc */}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm font-medium text-gray-900">
                            {formatNumberVND(item.product_id.sale_price)}
                          </p>
                        )}
                        <p className="mt-1 text-sm text-gray-500">
                          x{item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t">
                  <div className="flex flex-col sm:flex-row justify-between items-center">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-x-4 sm:space-y-0">
                      {(order?.orderStatus === "pending" ||
                        order?.orderStatus === "confirmed") && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors duration-200"
                        >
                          Yêu cầu hủy
                        </button>
                      )}

                      {order?.orderStatus === "delivered" && (
                        <button
                          onClick={() => handleConfirmDelivery(order?._id)}
                          className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors duration-200"
                        >
                          Đã nhận được hàng
                        </button>
                      )}
                      {order?.orderStatus !== "canceled" ? (
                        <Link to={`/order-tracking/${order._id}`}>
                          <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-200">
                            Theo dõi đơn hàng
                          </button>
                        </Link>
                      ) : (
                        <Link to={`/order-tracking/${order._id}`}>
                          <button className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg shadow-md hover:bg-red-200 transition-all duration-300">
                            Xem chi tiết
                          </button>
                        </Link>
                      )}
                    </div>
                    <div className="text-right mt-4 sm:mt-0">
                      <p className="text-sm text-gray-600">Thành tiền</p>
                      <p className="text-lg font-medium text-red-600">
                        {formatNumberVND(
                          (order?.totalPrice || 0) -
                            (order?.discountAmount || 0)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M19 10a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Không có đơn hàng nào
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Bắt đầu mua sắm để tạo đơn hàng mới.
            </p>
            <Link to={`/menu`}>
              <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300">
                Đi mua sắm
              </button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
export default OderHistory;
