import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import instance from "../../services/api";
import {
  Alert,
  Button,
  Drawer,
  Image,
  Input,
  InputNumber,
  DatePicker,
  message,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tag,
} from "antd";
import Title from "antd/es/typography/Title";
import { useState } from "react";
import { Order } from "../../types/order";
import { ProductSize, ProductTopping } from "../../types/product";
import ExportButton from "./components/ExportButton";
import { CloseOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
const { RangePicker } = DatePicker;
type PriceType = number | { $numberDecimal: string };
// Kiểu dữ liệu
type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipping"
  | "delivered"
  | "completed"
  | "canceled";
type Product = {
  _id: string;
  name: string;
  images: string[];
  price: number;
  sale_price: number;
  product_sizes: ProductSize[];
  product_toppings: ProductTopping[];
};

const OrderStatusLabels: Record<OrderStatus, string> = {
  pending: "Chờ Xác Nhận",
  confirmed: "Đã Xác Nhận",
  shipping: "Đang Giao Hàng",
  delivered: "Đã Giao Hàng",
  completed: "Hoàn Thành",
  canceled: "Đã Hủy",
};

const OrderManagerPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false); // Modal hủy đơn hàng
  const [cancellationReason, setCancellationReason] = useState("");
  const [orderNumberFilter, setOrderNumberFilter] = useState("");
  // Thêm state để lưu trạng thái filter
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  // Thêm vào state
  const [priceFilter, setPriceFilter] = useState<{
    min?: number;
    max?: number;
  }>({});

  const [dateFilter, setDateFilter] = useState<{
    startDate?: Date;
    endDate?: Date;
  }>({});

  const [customerNameFilter, setCustomerNameFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<
    OrderStatus | "all"
  >("all");

  const localStorageUser = localStorage.getItem("user");
  const storedUserId = localStorageUser
    ? JSON.parse(localStorageUser)._id
    : null;
  const {
    data: orders,
    isLoading,
    isError,
  } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await instance.get(`orders`);
      return response.data.data;
    },
    staleTime: 60000,
  });

  console.log(orders);
  console.log(selectedOrder);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination({ current: page, pageSize });
  };
  const showModal = (order: Order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({
      orderId,
      newStatus,
    }: {
      orderId: string;
      newStatus: string;
    }) => {
      const response = await instance.put(`/orders/status/${orderId}`, {
        status: newStatus,
      });
      console.log(response);
      return { orderId, newStatus };
    },
    onSuccess: ({ orderId, newStatus }) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      messageApi.success("Trạng thái đơn hàng đã được cập nhật thành công.");

      // Cập nhật trực tiếp trạng thái trong danh sách đơn hàng
      if (orders) {
        const updatedOrders = orders.map((order) =>
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        );
        queryClient.setQueryData(["orders"], updatedOrders);
      }

      // Cập nhật trạng thái trong selectedOrder nếu đang hiển thị modal
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          orderStatus: newStatus as OrderStatus,
        });
      }
    },
    onError: (error) => {
      messageApi.error(`Cập nhật thất bại: ${error.message}`);
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async ({
      orderId,
      reason,
    }: {
      orderId: string;
      reason: string;
    }) => {
      await instance.put(`/orders/cancel/${orderId}`, {
        reason,
      });
      return { orderId, reason };
    },
    onSuccess: ({ orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      messageApi.success("Đơn hàng đã được hủy thành công.");

      // Update the order status to canceled if payment status is failed
      if (orders) {
        const updatedOrders = orders.map((order) => {
          if (order._id === orderId) {
            // If paymentStatus is failed, set orderStatus to canceled
            return {
              ...order,
              orderStatus:
                order.paymentStatus === "failed"
                  ? "canceled"
                  : order.orderStatus,
            };
          }
          return order;
        });
        queryClient.setQueryData(["orders"], updatedOrders);
      }
      setIsCancelModalVisible(false);
      setCancellationReason("");
    },
    onError: (error) => {
      messageApi.error(`Cập nhật thất bại: ${error.message}`);
    },
  });
  const formatPrice = (price: PriceType) => {
    const amount =
      typeof price === "object" && price?.$numberDecimal
        ? Number(price.$numberDecimal)
        : typeof price === "number"
        ? price
        : 0;

    return `${amount.toLocaleString("vi-VN")} VNĐ`;
  };

  const handleStatusChange = (newStatus: OrderStatus, currentOrder: Order) => {
    const statusOrder: OrderStatus[] = [
      "pending",
      "confirmed",
      "shipping",
      "delivered",
      "completed",
      "canceled",
    ];

    const currentStatusIndex = statusOrder.indexOf(currentOrder.orderStatus);
    const newStatusIndex = statusOrder.indexOf(newStatus);

    if (newStatusIndex === -1 || currentStatusIndex === -1) {
      messageApi.error("Trạng thái không hợp lệ.");
      return;
    }

    if (
      newStatus === "canceled" &&
      !["pending", "confirmed"].includes(currentOrder.orderStatus)
    ) {
      messageApi.error(
        "Bạn chỉ có thể hủy đơn hàng khi trạng thái là 'chờ xác nhận' hoặc 'đã xác nhận'."
      );
      return;
    }

    if (newStatusIndex < currentStatusIndex) {
      messageApi.error("Không thể quay lại trạng thái trước đó.");
      return;
    }

    updateOrderStatusMutation.mutate({
      orderId: currentOrder._id,
      newStatus,
    });
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "text-[#FCCD2A]";
      case "confirmed":
        return "text-[#399918]";
      case "shipping":
        return "text-[#008DDA]";
      case "delivered":
        return "text-[#399918]";
      case "completed":
        return "text-[#399918]";
      case "canceled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getRowClassName = (record: Order) => {
    return record.orderStatus === "canceled" ? "row-canceled" : "";
  };

  const handleCancelOrder = (order: Order) => {
    const nonCancellableStatuses: OrderStatus[] = [
      "shipping",
      "delivered",
      "completed",
    ];

    // Check if the payment status is failed
    if (order.paymentStatus === "failed") {
      messageApi.error("Đơn hàng này đã hủy do thanh toán thất bại.");
      return;
    }

    if (nonCancellableStatuses.includes(order.orderStatus)) {
      messageApi.error("Đơn hàng này không thể hủy ở trạng thái hiện tại.");
      return;
    }

    setSelectedOrder(order);
    setIsCancelModalVisible(true);
  };

  const handleCancelSubmit = () => {
    if (selectedOrder && cancellationReason.trim() === "") {
      messageApi.error("Vui lòng nhập lý do hủy.");
      return;
    }

    if (selectedOrder) {
      cancelOrderMutation.mutate({
        orderId: selectedOrder._id,
        reason: cancellationReason,
      });
    }
  };

  const paymentMethods = [
    { value: "all", label: "Tất cả" },
    { value: "cash on delivery", label: "Thanh Toán Khi Nhận Hàng" },
    { value: "momo", label: "Momo" },
    { value: "zalopay", label: "ZaloPay" },
    { value: "vnpay", label: "VNPay" },
  ];

  const columns = [
    {
      title: "STT",
      render: (text: string, record: Order, index: number) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
      width: 60,
    },
    {
      title: "Mã Đơn Hàng",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (orderNumber: string, order: Order) => (
        <Link to={`/admin/order-detail/${order._id}`}>
          <span
            className={`text-gray-950 cursor-pointer hover:text-blue-700 ${
              order.orderStatus === "canceled" ? "text-red-600" : ""
            }`}
          >
            {orderNumber}
          </span>
        </Link>
      ),
      width: 200,
    },
    {
      title: "Tên Khách Hàng",
      dataIndex: "customerInfo",
      key: "name",
      render: (customerInfo: Order["customerInfo"]) => {
        const customerName = customerInfo?.name || "N/A";
        return customerName;
      },
    },
    {
      title: "Tổng Đơn Hàng",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (totalPrice: number) => formatPrice(totalPrice),
      width: 200,
    },
    {
      title: "Phương Thức Thanh Toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method: string) => {
        switch (method) {
          case "vnpay":
            return "VNPay";
          case "cash on delivery":
            return "Thanh Toán Khi Nhận Hàng";
          case "momo":
            return "Momo";
          case "zalopay":
            return "ZaloPay";
          default:
            return method;
        }
      },
      width: 200,
    },
    {
      title: "Trạng Thái",
      dataIndex: "orderStatus",
      with: 200,
      render: (status: OrderStatus) => {
        const statusColors = {
          pending: "orange",
          confirmed: "green",
          shipping: "blue",
          delivered: "green",
          completed: "success",
          canceled: "red",
        };
        return (
          <Tag color={statusColors[status]}>{OrderStatusLabels[status]}</Tag>
        );
      },
    },

    {
      title: "Hành Động",
      render: (text: string, record: Order) => (
        <Button
          type="primary"
          danger
          onClick={() => handleCancelOrder(record)}
          disabled={
            ["shipping", "delivered", "completed", "canceled"].includes(
              record.orderStatus
            ) ||
            (record.paymentStatus !== "failed" &&
              ["momo", "zalopay"].includes(record.paymentMethod))
          }
        >
          Hủy Đơn
        </Button>
      ),
    },
  ];

  const handleStatusFilterChange = (value: OrderStatus | "all") => {
    setStatusFilter(value);
    setPagination({ ...pagination, current: 1 });
  };

  // Thêm hàm lọc đơn hàng mở rộng
  const getFilteredOrders = () => {
    if (!orders) return [];

    return orders.filter((order) => {
      // Xử lý từ khóa, loại bỏ toàn bộ khoảng trắng
      const processSearchTerm = (term: string) => {
        return term
          .trim()
          .replace(/\s+/g, "") // Loại bỏ TOÀN BỘ khoảng trắng
          .toLowerCase();
      };

      // Xử lý từ khóa tìm kiếm
      const processedOrderNumberFilter = processSearchTerm(orderNumberFilter);
      const processedCustomerNameFilter = processSearchTerm(customerNameFilter);

      // Kiểm tra mã đơn hàng
      const orderNumberMatch =
        processedOrderNumberFilter === "" ||
        order.orderNumber
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(processedOrderNumberFilter);

      const customerNameMatch =
        processedCustomerNameFilter === "" ||
        order.customerInfo?.name
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(processedCustomerNameFilter);

      // Các điều kiện lọc khác giữ nguyên
      const statusMatch =
        statusFilter === "all" || order.orderStatus === statusFilter;

      const priceMatch =
        (!priceFilter.min || order.totalPrice >= priceFilter.min) &&
        (!priceFilter.max || order.totalPrice <= priceFilter.max);

      const dateMatch =
        (!dateFilter.startDate ||
          new Date(order.createdAt) >= dateFilter.startDate) &&
        (!dateFilter.endDate ||
          new Date(order.createdAt) <= dateFilter.endDate);

      const paymentMethodMatch =
        paymentMethodFilter === "all" ||
        order.paymentMethod === paymentMethodFilter;

      return (
        statusMatch &&
        priceMatch &&
        dateMatch &&
        customerNameMatch &&
        paymentMethodMatch &&
        orderNumberMatch
      );
    });
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        message="Lỗi"
        description={`Không tìm thấy đơn hàng nào`}
        type="error"
        showIcon
      />
    );
  }

  return (
    <>
      {contextHolder}
      <div className="">
        <div className="flex items-center justify-between">
          <Title level={3} className="text-2xl font-semibold text-gray-800">
            Danh sách đơn hàng
          </Title>

          <Space className="ml-60">
            <Input
              placeholder="Tìm theo mã đơn hàng"
              value={orderNumberFilter}
              onChange={(e) => setOrderNumberFilter(e.target.value)}
              className="w-48 h-8 border border-gray-300 rounded-lg shadow-sm hover:border-blue-500 focus:border-blue-600 focus:ring focus:ring-blue-300 transition duration-200 ease-in-out"
            />
            <Input
              placeholder="Tìm theo tên khách hàng"
              value={customerNameFilter}
              onChange={(e) => setCustomerNameFilter(e.target.value)}
              className="w-48 h-8 border border-gray-300 rounded-lg shadow-sm hover:border-blue-500 focus:border-blue-600 focus:ring focus:ring-blue-300 transition duration-200 ease-in-out"
            />
            <ExportButton filteredOrders={getFilteredOrders()} />{" "}
          </Space>
        </div>

        <div className="grid grid-cols-4">
          <Space className="mt-5">
            <Select
              className="w-48 border border-gray-300 rounded-lg shadow-sm hover:border-blue-500 focus:border-blue-600 focus:ring focus:ring-blue-300 transition duration-200 ease-in-out"
              value={paymentMethodFilter}
              onChange={setPaymentMethodFilter}
            >
              {paymentMethods.map((method) => (
                <Select.Option key={method.value} value={method.value}>
                  {method.label}
                </Select.Option>
              ))}
            </Select>
            {paymentMethodFilter !== "all" && (
              <CloseOutlined
                onClick={() => setPaymentMethodFilter("all")}
                className="w-4 h-4 text-gray-600 hover:text-red-600 transition duration-200 ease-in-out cursor-pointer"
              />
            )}
            <Select
              className="w-48 border border-gray-300 rounded-lg shadow-sm hover:border-blue-500 focus:border-blue-600 focus:ring focus:ring-blue-300 transition duration-200 ease-in-out"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <Select.Option value="all">
                <span className="font-semibold text-gray-700">Tất cả</span>
              </Select.Option>
              {Object.entries(OrderStatusLabels).map(([key, label]) => (
                <Select.Option key={key} value={key}>
                  <span
                    className={`font-semibold ${getStatusColor(
                      key as OrderStatus
                    )}`}
                  >
                    {label}
                  </span>
                </Select.Option>
              ))}
            </Select>
            {statusFilter !== "all" && (
              <CloseOutlined
                onClick={() => handleStatusFilterChange("all")}
                className="w-4 h-4 text-gray-600 hover:text-red-600 transition duration-200 ease-in-out cursor-pointer"
              />
            )}
            <InputNumber
              placeholder="Giá tối thiểu"
              className="border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:border-gray-500 focus:ring focus:ring-gray-200 transition duration-200 ease-in-out"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
              onChange={(value: number | undefined) => {
                setPriceFilter((prev) => ({ ...prev, min: value }));
              }}
            />
            <InputNumber
              placeholder="Giá tối đa"
              className="border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:border-gray-500 focus:ring focus:ring-gray-200 transition duration-200 ease-in-out"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
              onChange={(value: number | undefined) => {
                setPriceFilter((prev) => ({ ...prev, max: value }));
              }}
            />

            <div className="flex flex-wrap items-center space-x-4 w-[200px]">
              <RangePicker
                placeholder={["Từ ngày", "Đến ngày"]}
                className="border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:border-gray-500 focus:ring focus:ring-gray-200 transition duration-200 ease-in-out"
                onChange={(dates) => {
                  setDateFilter({
                    startDate: dates ? dates[0]?.toDate() : null,
                    endDate: dates ? dates[1]?.toDate() : null,
                  });
                }}
              />
            </div>
          </Space>
        </div>
      </div>

      <Table
        className="mt-5"
        columns={columns}
        dataSource={getFilteredOrders()}
        rowKey="orderNumber"
        scroll={{ y: 260 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          onChange: handlePaginationChange,
          total: getFilteredOrders().length,
        }}
        rowClassName={getRowClassName}
      />
      <Modal
        title={
          <h2 className="text-xl font-bold text-red-500">
            Xác Nhận Hủy Đơn Hàng
          </h2>
        }
        open={isCancelModalVisible}
        onCancel={() => setIsCancelModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsCancelModalVisible(false)}>
            Thoát
          </Button>,
          <Button
            key="submit"
            type="primary"
            className="bg-red-500"
            onClick={handleCancelSubmit}
          >
            Xác Nhận Hủy Đơn
          </Button>,
        ]}
      >
        <p className="mt-3 mb-2">Vui lòng chọn lý do hủy đơn hàng:</p>

        <Select
          className="w-full mb-3"
          placeholder="Chọn lý do hủy đơn"
          onChange={setCancellationReason}
          options={[
            { value: "Sản phẩm hết hàng", label: "Sản phẩm đã hết hàng" },
            { value: "Lỗi đặt hàng", label: "Lỗi từ hệ thống đặt hàng" },
            {
              value: "Không liên hệ được",
              label: "Không thể liên hệ khách hàng",
            },
            {
              value: "Khách hàng yêu cầu hủy",
              label: "Khách hàng yêu cầu hủy",
            },
            { value: "", label: "Lý do khác" },
          ]}
        />

        <Input.TextArea
          rows={4}
          value={cancellationReason}
          onChange={(e) => setCancellationReason(e.target.value)}
          placeholder="Chi tiết lý do hủy đơn (nếu có)..."
        />
      </Modal>

      <style>{`
        .row-canceled {
          color:rgb(224 36 36)
        }
      `}</style>
    </>
  );
};

export default OrderManagerPage;
