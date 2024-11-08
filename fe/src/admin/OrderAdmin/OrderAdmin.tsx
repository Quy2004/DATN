import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import instance from "../../services/api";
import { Alert, Image, message, Modal, Select, Spin, Table } from "antd";
import Title from "antd/es/typography/Title";
import { Order } from "../../types/order";
import { useState } from "react";
import { Product } from "../../types/product";
import { Button } from "flowbite-react";

type PriceType = number | { $numberDecimal: string };

const OrderManagerPage = () => {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const {
    data: orders,
    isLoading,
    isError,
    error,
  } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      try {
        const response = await instance.get("orders");
        return response.data.data;
      } catch (error) {
        throw new Error("Lỗi khi tải danh sách đơn hàng");
      }
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
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      messageApi.success("Trạng thái đơn hàng đã được cập nhật thành công.");
    },
    onError: (error) => {
      messageApi.error(`Cập nhật thất bại: ${error.message}`);
    },
  });

  const getStatus = (status: Order["orderStatus"]) => {
    switch (status) {
      case "pending":
        return "Đang chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "preparing":
        return "Đang chuẩn bị";
      case "shipping":
        return "Đang giao hàng";
      case "delivered":
        return "Đã giao hàng";
      case "completed":
        return "Đã hoàn thành";
      case "canceled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };
  const handleStatusChange = async (
    newStatus: string,
    currentStatus: string,
    orderId: string,
    updateOrderStatusMutation: any,
    messageApi: any
  ) => {
    // Danh sách các trạng thái không thể quay lại
    const cannotRevertStatuses = [
      "confirmed",
      "preparing",
      "shipping",
      "delivered",
      "completed",
    ];

    // Quy tắc chuyển đổi trạng thái
    switch (newStatus) {
      case "pending":
        if (cannotRevertStatuses.includes(currentStatus)) {
          messageApi.warning(
            "Không thể quay lại trạng thái 'Đang chờ xác nhận'"
          );
          return;
        }
        break;
      case "confirmed":
        if (currentStatus === "pending") {
          break;
        }
        messageApi.warning(
          "Chỉ có thể chuyển từ 'Đang chờ xác nhận' sang 'Đã xác nhận'."
        );
        return;
      case "preparing":
        if (currentStatus !== "confirmed") {
          messageApi.warning(
            "Chỉ có thể chuyển từ 'Đã xác nhận' sang 'Đang chuẩn bị'."
          );
          return;
        }
        break;
      case "shipping":
        if (currentStatus !== "preparing") {
          messageApi.warning(
            "Chỉ có thể chuyển từ 'Đang chuẩn bị' sang 'Đang giao hàng'."
          );
          return;
        }
        break;
      case "delivered":
        if (currentStatus !== "shipping") {
          messageApi.warning(
            "Chỉ có thể chuyển từ 'Đang giao hàng' sang 'Đã giao hàng'."
          );
          return;
        }
        break;
      case "completed":
        if (currentStatus !== "delivered") {
          messageApi.warning(
            "Chỉ có thể chuyển từ 'Đã giao hàng' sang 'Đã hoàn thành'."
          );
          return;
        }
        break;
      case "canceled":
        if (["completed", "delivered"].includes(currentStatus)) {
          messageApi.warning("Không thể hủy đơn hàng ở trạng thái này.");
          return;
        }
        break;
      default:
        messageApi.error("Trạng thái không hợp lệ.");
        return;
    }

    // Nếu tất cả điều kiện hợp lệ, tiến hành cập nhật trạng thái
    updateOrderStatusMutation.mutate({
      orderId,
      newStatus,
    });
  };

  const formatPrice = (price: PriceType) => {
    const amount =
      typeof price === "object" && price?.$numberDecimal
        ? Number(price.$numberDecimal)
        : typeof price === "number"
        ? price
        : 0;

    return `${amount.toLocaleString("vi-VN")} VNĐ`;
  };

  const columns = [
    {
      title: "Số Đơn Hàng",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (orderNumber: string, record: Order) => (
        <span
          onClick={() => showModal(record)}
          className="text-gray-950 cursor-pointer hover:text-blue-700"
        >
          {orderNumber}
        </span>
      ),
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
      title: "Tổng Giá",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (totalPrice: number) => formatPrice(totalPrice),
    },
    {
      title: "Phương Thức Thanh Toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
    },
    {
      title: "Trạng Thái",
      dataIndex: "orderStatus",
      key: "orderStatus",
      render: (status: Order["orderStatus"], record: Order) => (
        <Select
          defaultValue={status}
          disabled={status === "canceled"} // Vô hiệu hóa Select nếu trạng thái là "canceled"
          onChange={(newStatus) => {
            handleStatusChange(
              newStatus,
              status,
              record._id,
              updateOrderStatusMutation,
              messageApi
            );
          }}
          className="w-[150px] rounded-md"
        >
          <Select.Option value="pending">Đang chờ xác nhận</Select.Option>
          <Select.Option value="confirmed">Đã xác nhận</Select.Option>
          <Select.Option value="preparing">Đang chuẩn bị</Select.Option>
          <Select.Option value="shipping">Đang giao hàng</Select.Option>
          <Select.Option value="delivered">Đã giao hàng</Select.Option>
          <Select.Option value="completed">Đã hoàn thành</Select.Option>
          <Select.Option value="canceled">Đã hủy</Select.Option>
        </Select>
      ),
    },
  ];

  const itemColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "product_id",
      key: "product_id",
      render: (product: Product) => product.name,
    },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
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
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price: PriceType) => formatPrice(price),
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
      <Title level={3}>Danh sách đơn hàng</Title>
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="orderNumber"
        scroll={{ x: "max-content", y: 350 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          onChange: handlePaginationChange,
          total: orders?.length, // Assuming your backend returns the total number of records
        }}
      />

      <Modal
        title={<h2 className="text-xl font-bold">Chi tiết đơn hàng</h2>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button key="close" onClick={() => setIsModalVisible(false)}>
              Đóng
            </Button>
          </div>,
        ]}
        destroyOnClose
      >
        {selectedOrder && (
          <>
            <p>Số đơn hàng: #{selectedOrder.orderNumber}</p>
            <p>
              Ngày đặt hàng:
              <span className="mx-1">
                {new Date(selectedOrder.updatedAt).toLocaleString("vi-VN")}
              </span>
            </p>
            <p>Tên khách hàng: {selectedOrder.customerInfo?.name || "N/A"} </p>
            <p>Email: {selectedOrder.customerInfo?.email}</p>
            <p>Tổng giá: {formatPrice(selectedOrder.totalPrice)}</p>
            <p>Trạng thái: {getStatus(selectedOrder.orderStatus)}</p>

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
      </Modal>
    </>
  );
};

export default OrderManagerPage;
