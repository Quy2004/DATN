import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import instance from "../../services/api";
import {
  Alert,
  Button,
  Drawer,
  Image,
  Input,
  message,
  Modal,
  Select,
  Spin,
  Table,
  Tag,
} from "antd";
import Title from "antd/es/typography/Title";
import { useState } from "react";
import { Order } from "../../types/order";
import { ProductSize, ProductTopping } from "../../types/product";

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
  shipping: "Đang Giao",
  delivered: "Đã Giao",
  completed: "Hoàn Thành",
  canceled: "Đã Hủy",
};

const OrderManagerPage = () => {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false); // Modal hủy đơn hàng
  const [cancellationReason, setCancellationReason] = useState("");
  // Thêm state để lưu trạng thái filter
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const localStorageUser = localStorage.getItem("user");
  const storedUserId = localStorageUser
    ? JSON.parse(localStorageUser)._id
    : null;

  const {
    data: orders,
    isLoading,
    isError,
    error,
  } = useQuery<Order[]>({
    queryKey: ["orders", storedUserId],
    queryFn: async () => {
      if (!storedUserId) {
        console.error("User ID is not available.");
        throw new Error("User ID is not available.");
      }
      console.log("Fetching orders for User ID:", storedUserId);
      const response = await instance.get(`orders/${storedUserId}`);

      if (!response.data || !response.data.data) {
        console.error("Invalid response structure:", response.data);
        throw new Error("Invalid response structure.");
      }
      return response.data.data;
    },
    staleTime: 60000,
    enabled: !!storedUserId,
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

      // Cập nhật trạng thái đơn hàng
      if (orders) {
        const updatedOrders = orders.map((order) =>
          order._id === orderId ? { ...order, orderStatus: "canceled" } : order
        );
        queryClient.setQueryData(["orders"], updatedOrders);
      }
      // Đóng modal
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
      messageApi.error("Trạng thái không hợp lệ");
      return;
    }

    const isValidTransition =
      newStatusIndex === currentStatusIndex + 1 ||
      (newStatus === "canceled" && currentOrder.orderStatus === "pending") ||
      (newStatus === "completed" && currentOrder.orderStatus === "delivered");

    if (!isValidTransition) {
      messageApi.error(
        `Không thể chuyển từ trạng thái "${
          OrderStatusLabels[currentOrder.orderStatus]
        }" sang "${
          OrderStatusLabels[newStatus]
        }". Vui lòng chuyển trạng thái theo từng bước.`
      );
      return;
    }

    if (newStatus === "completed") {
      // Kiểm tra người dùng đã nhận hàng chưa
      if (currentOrder.orderStatus !== "delivered") {
        messageApi.error(
          "Chỉ có thể hoàn thành đơn hàng sau khi đơn hàng đã được giao."
        );
        return;
      }
    } else {
      // Cập nhật trạng thái cho các trạng thái khác ngoài "hoàn thành"
      updateOrderStatusMutation.mutate({
        orderId: currentOrder._id,
        newStatus,
      });
    }
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
      "confirmed",
      "shipping",
      "delivered",
      "completed",
    ];

    if (nonCancellableStatuses.includes(order.orderStatus)) {
      messageApi.error("Đơn hàng này không thể hủy ở trạng thái hiện tại.");
      return;
    }

    setSelectedOrder(order);
    setIsCancelModalVisible(true); // Hiển thị modal hủy
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
      render: (orderNumber: string, record: Order) => (
        <span
          onClick={() => showModal(record)}
          className={`text-gray-950 cursor-pointer hover:text-blue-700 ${
            record.orderStatus === "canceled" ? "text-red-600" : ""
          }`}
        >
          {orderNumber}
        </span>
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
          case "bank transfer":
            return "Chuyển Khoản";
          case "cash on delivery":
            return "Thanh Toán Khi Nhận Hàng";
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
          disabled={[
            "confirmed",
            "shipping",
            "delivered",
            "completed",
            "canceled",
          ].includes(record.orderStatus)}
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

  const getFilteredOrders = () => {
    if (!orders) return [];
    if (statusFilter === "all") return orders;
    return orders.filter((order) => order.orderStatus === statusFilter);
  };

  const itemColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "product_id",
      key: "product_id",
      width: 200,
      render: (product: Product) => {
        const maxLength = 20;
        const truncatedName =
          product.name.length > maxLength
            ? product.name.substring(0, maxLength) + "..."
            : product.name;

        return truncatedName;
      },
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      width: 200,
      render: (image: string) => {
        return image ? (
          <Image
            src={image}
            alt="Product"
            style={{ width: 50, height: 50 }}
            preview={true}
          />
        ) : (
          <span>Không có hình ảnh</span>
        );
      },
    },
    {
      title: "Size",
      dataIndex: "product_size",

      key: "size",
      render: (selectedSize: { name: string }) => {
        return selectedSize?.name || "Không có kích cỡ";
      },
    },
    {
      title: "Topping",
      dataIndex: "product_toppings",

      key: "topping",
      render: (productToppings: ProductTopping[]) => {
        if (!productToppings || !productToppings.length)
          return "Không có topping";
        const toppings = productToppings.map(
          (item: ProductTopping) => item.topping_id.nameTopping
        );

        return toppings.length ? toppings.join(", ") : "Không có topping";
      },
    },
    {
      title: "Giá",
      width: 200,
      dataIndex: "price",
      key: "price",
      render: (price: PriceType, record: Product) => {
        const priceToShow = record.sale_price || price;
        return formatPrice(priceToShow);
      },
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },

    {
      title: "Giá tổng",
      dataIndex: "totalPrice",
      key: "totalPrice",
      width: 200,
      render: (text: string, record: any) => {
        const productPrice = record.sale_price || record.price || 0;
        const sizePrice = record.product_size?.priceSize || 0;
        const toppingsPrice =
          record.product_toppings?.reduce(
            (total: string, topping: ProductTopping) => {
              return total + (topping.topping_id?.priceTopping || 0);
            },
            0
          ) || 0;
        const totalPrice =
          (productPrice + sizePrice + toppingsPrice) * record.quantity;

        return formatPrice(totalPrice);
      },
    },
  ];

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
        description={`Có lỗi xảy ra khi tải dữ liệu: ${error.message}`}
        type="error"
        showIcon
      />
    );
  }

  return (
    <>
      {contextHolder}
      <div className="flex items-center justify-between mb-5 space-x-4"></div>
      <Title level={3} className="text-2xl font-semibold text-gray-700">
        Danh sách đơn hàng
      </Title>
      <div className="mb-4 flex items-center mt-6">
        <Select
          style={{ width: 200 }}
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="mr-2"
        >
          <Select.Option value="all">
            <span className="font-semibold">Tất cả</span>
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
          <Button
            onClick={() => handleStatusFilterChange("all")}
            size="small"
            className="flex items-center"
          >
            Xóa bộ lọc
          </Button>
        )}
      </div>
      <Table
        className="mt-5"
        columns={columns}
        dataSource={getFilteredOrders()}
        rowKey="orderNumber"
        scroll={{ y: 350 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          onChange: handlePaginationChange,
          total: getFilteredOrders().length,
        }}
        rowClassName={getRowClassName}
      />
      <Modal
        title={<h2 className="text-xl font-bold text-red-500">Hủy Đơn Hàng</h2>}
        open={isCancelModalVisible}
        onCancel={() => setIsCancelModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsCancelModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="submit"
            type="primary"
            className="bg-lime-500"
            onClick={handleCancelSubmit}
          >
            Hủy Đơn
          </Button>,
        ]}
      >
        <p className="mt-3 mb-2">Vui lòng nhập lý do hủy đơn hàng:</p>
        <Input.TextArea
          rows={4}
          value={cancellationReason}
          onChange={(e) => setCancellationReason(e.target.value)}
          placeholder="Lý do hủy..."
        />
      </Modal>

      <Drawer
        title={<h2 className="text-xl font-bold">Chi tiết đơn hàng</h2>}
        open={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        width={600}
        destroyOnClose
        footer={[
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button key="close" onClick={() => setIsModalVisible(false)}>
              Đóng
            </Button>
          </div>,
        ]}
      >
        {selectedOrder && (
          <>
            <p>Số đơn hàng: #{selectedOrder.orderNumber}</p>
            <p>
              Ngày đặt hàng:
              <span className="mx-1">
                {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
              </span>
            </p>
            <p>
              Ngày cập nhật:
              <span className="mx-1">
                {new Date(selectedOrder.updatedAt).toLocaleString("vi-VN")}
              </span>
            </p>
            <p>Tên khách hàng: {selectedOrder.customerInfo?.name || "N/A"} </p>
            <p>Email: {selectedOrder.customerInfo?.email}</p>
            <p>Tổng đơn hàng: {formatPrice(selectedOrder.totalPrice)}</p>
            <p style={{ display: "flex", alignItems: "center" }}>
              <span style={{ marginRight: 8 }}>Trạng thái:</span>
              <Select
                className="w-40 ml-2"
                value={selectedOrder.orderStatus}
                onChange={(newStatus) =>
                  handleStatusChange(newStatus, selectedOrder)
                }
                disabled={["completed", "canceled"].includes(
                  selectedOrder.orderStatus
                )}
              >
                {Object.entries(OrderStatusLabels).map(([key, label]) => (
                  <Select.Option key={key} value={key}>
                    <span
                      className={`font-semibold px-2 py-1 rounded-md ${getStatusColor(
                        key as OrderStatus
                      )}`}
                    >
                      {label}
                    </span>
                  </Select.Option>
                ))}
              </Select>
            </p>
            {selectedOrder.orderStatus === "canceled" &&
              selectedOrder.cancellationReason && (
                <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md">
                  <div className="flex items-center">
                    <h4 className="text-lg font-semibold text-red-600">
                      Đơn hàng bị hủy
                    </h4>
                  </div>
                  <p className="mt-2 text-sm text-red-600">
                    <strong>Lý do hủy: </strong>
                    {selectedOrder.cancellationReason}
                  </p>
                </div>
              )}

            <h4 className="mt-4 mb-2 text-lg">Chi tiết sản phẩm:</h4>
            <Table
              columns={itemColumns}
              dataSource={selectedOrder.orderDetail_id}
              pagination={false}
              rowKey="_id"
              className="border border-gray-300 rounded-md shadow-md"
              style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}
            />
          </>
        )}
      </Drawer>

      <style>{`
        .row-canceled {
          color:rgb(224 36 36)
        }
      `}</style>
    </>
  );
};

export default OrderManagerPage;
