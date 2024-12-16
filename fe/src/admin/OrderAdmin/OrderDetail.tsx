import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  message,
  Select,
  Table,
  Modal,
  Button,
  Input,
  Spin,
  Alert,
} from "antd";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { Link, useParams } from "react-router-dom";
import { Product, ProductTopping } from "../../types/product";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import instance from "../../services/api";
import Title from "antd/es/typography/Title";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faMapMarkerAlt,
  faCreditCard,
  faCheckCircle,
  faReceipt,
  faCalendarAlt,
  faClock,
  faMoneyBillWave,
  faStickyNote,
} from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";

library.add(faUser, faEnvelope, faMapMarkerAlt, faCreditCard, faCheckCircle);

// Types
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipping"
  | "delivered"
  | "completed"
  | "canceled";

export type PaymentMethod = "vnpay" | "cash on delivery" | "momo" | "zalopay";

export type PaymentStatus = "pending" | "unpaid" | "paid" | "failed";

type PriceType = number | { $numberDecimal: string };

interface CustomerInfo {
  name: string;
  email: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  totalPrice: PriceType;
  customerInfo: CustomerInfo;
  discountAmount: number;
  orderDetail_id: Array<any>; // Replace with actual order detail type
  createdAt: string;
  updatedAt: string;
  cancellationReason?: string;
}

interface OrderDetailProps {
  order: Order;
  onStatusChange: (newStatus: OrderStatus, order: Order) => void;
  itemColumns: any[]; // Replace with actual column type
}

const OrderStatusLabels: Record<OrderStatus, string> = {
  pending: "Chờ Xác Nhận",
  confirmed: "Đã Xác Nhận",
  shipping: "Đang Giao Hàng",
  delivered: "Đã Giao Hàng",
  completed: "Hoàn Thành",
  canceled: "Đã Hủy",
};

const OrderDetail: React.FC = () => {
  // const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false); // Modal hủy đơn hàng
  const [cancellationReason, setCancellationReason] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // const { order } = location.state || {};
  const [orderState, setOrderState] = useState<Order | null>();
  const {
    data: order,
    isLoading,
    isError,
  } = useQuery<Order>({
    queryKey: ["orders", id],
    queryFn: async () => {
      const response = await instance.get(`orders/order/${id}`);
      return response.data.data;
    },
    staleTime: 0,
  });

  console.log(order);

  // Update the order state when the order prop changes
  useEffect(() => {
    if (order) {
      setOrderState(order);
    }
  }, [order]);

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
      return { orderId, newStatus };
    },
    onSuccess: ({ orderId, newStatus }) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      // Update the local state directly
      setOrderState((prevState) => {
        if (!prevState) return null;
        return { ...prevState, orderStatus: newStatus };
      });

      messageApi.success("Trạng thái đơn hàng đã được cập nhật thành công.");
    },
    onError: (error) => {
      messageApi.error(`Cập nhật thất bại: ${error.message}`);
    },
  });

  const { mutate: updatePaymentStatus } = useMutation({
    mutationFn: async ({
      orderId,
      newStatus,
    }: {
      orderId: string;
      newStatus: string;
    }) => {
      const response = await instance.put(`/orders/payment-status/${orderId}`, {
        status: newStatus,
      });
      return response.data;
    },
    onSuccess: ({ data }) => {
      const { _id: orderId, paymentStatus } = data;

      // Hiển thị thông báo thành công
      messageApi.success("Trạng thái thanh toán đã được cập nhật thành công.");

      // Làm mới danh sách đơn hàng trong query cache
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });

      // Cập nhật trực tiếp trong cache nếu đã có dữ liệu
      const cachedOrders = queryClient.getQueryData<Order[]>(["orders"]);
      if (cachedOrders) {
        const updatedOrders = cachedOrders.map((order) =>
          order._id === orderId ? { ...order, paymentStatus } : order
        );
        queryClient.setQueryData(["orders"], updatedOrders);
      }
    },
    onError: (error: any) => {
      // Hiển thị thông báo lỗi
      messageApi.error(
        `Cập nhật thất bại: ${error.response?.data?.message || error.message}`
      );
    },
  });
  useEffect(() => {
    if (order?.orderStatus === "delivered" && order?.paymentStatus !== "paid") {
      updatePaymentStatus({ orderId: order._id, newStatus: "paid" });
    }
  }, [order?.orderStatus, order?.paymentStatus]);

  const handleChangePaymentStatus = (newStatus: string) => {
    updatePaymentStatus({ orderId: order._id, newStatus });
  };

  const paymentStatusOptions = [
    { value: "pending", label: "Đang chờ xử lý" },
    { value: "paid", label: "Đã thanh toán" },
    { value: "failed", label: "Thanh toán thất bại" },
  ];

  const cancelOrderMutation = useMutation({
    mutationFn: async ({ orderId, reason }) => {
      const response = await instance.put(`/orders/cancel/${orderId}`, {
        reason,
      });
      return { orderId, reason };
    },
    onSuccess: ({ orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      setOrderState((prevState) => {
        if (prevState && prevState._id === orderId) {
          return { ...prevState, orderStatus: "canceled", cancellationReason };
        }
        return prevState;
      });

      messageApi.success("Đơn hàng đã được hủy thành công.");
      setIsCancelModalVisible(false);
      setCancellationReason("");
    },
    onError: (error) => {
      messageApi.error(`Cập nhật thất bại: ${error.message}`);
    },
  });
  const handleCancelOrder = (order: Order) => {
    const nonCancellableStatuses: OrderStatus[] = [
      "shipping",
      "delivered",
      "completed",
    ];

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
  if (!order) return null;

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

    if (newStatus === "canceled") {
      // Mở modal huỷ nếu trạng thái mới là "canceled"
      setSelectedOrder(currentOrder);
      setIsCancelModalVisible(true);
      return; // Thoát sớm để ngăn xử lý thêm
    }

    // Kiểm tra trạng thái hợp lệ
    if (newStatusIndex === -1 || currentStatusIndex === -1) {
      messageApi.error("Trạng thái không hợp lệ.");
      return;
    }

    // Ngăn chuyển trạng thái về trước
    if (newStatusIndex < currentStatusIndex) {
      messageApi.error("Không thể quay lại trạng thái trước đó.");
      return;
    }

    // Ngăn admin tự chuyển trạng thái sang "completed"
    if (newStatus === "completed") {
      messageApi.error(
        "Trạng thái 'hoàn thành' chỉ có thể được thay đổi bởi khách hàng."
      );
      return;
    }

    // Cập nhật trạng thái nếu hợp lệ
    updateOrderStatusMutation.mutate({
      orderId: currentOrder._id,
      newStatus,
    });
  };

  const getStatusColor = (status: OrderStatus): string => {
    const statusColors: Record<OrderStatus, string> = {
      pending: "text-[#FCCD2A]",
      confirmed: "text-[#399918]",
      shipping: "text-[#008DDA]",
      delivered: "text-[#399918]",
      completed: "text-[#399918]",
      canceled: "text-red-600",
    };
    return statusColors[status] || "text-gray-600";
  };

  const paymentMethodDisplay = (method: PaymentMethod): string => {
    const methodLabels: Record<PaymentMethod, string> = {
      vnpay: "VNPay",
      "cash on delivery": "Thanh Toán Khi Nhận Hàng",
      momo: "Momo",
      zalopay: "ZaloPay",
    };
    return methodLabels[method];
  };

  const paymentStatusDisplay = (status: PaymentStatus): string => {
    const statusLabels: Record<PaymentStatus, string> = {
      pending: "Đang chờ xử lí",
      unpaid: "Chưa Thanh Toán",
      paid: "Đã Thanh Toán",
      failed: "Thanh Toán Thất Bại",
    };
    return statusLabels[status];
  };
  const formatPrice = (price: number) => {
    // Sử dụng Intl.NumberFormat để định dạng số theo tiền tệ VNĐ
    return new Intl.NumberFormat("vi-VN").format(price);
  };
  const discountAmount = order.discountAmount;
  console.log(discountAmount);

  const itemColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "product_id",
      key: "product_id",
      render: (product: Product) => {
        const maxLength = 20;
        return product.name.length > maxLength
          ? `${product.name.substring(0, maxLength)}...`
          : product.name;
      },
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (image: string) =>
        image ? (
          <Image
            src={image}
            alt="Product"
            style={{ width: 50, height: 50 }}
            preview={true}
          />
        ) : (
          <span>Không có hình ảnh</span>
        ),
    },
    {
      title: "Size",
      dataIndex: "product_size",
      key: "size",
      render: (selectedSize: Product) => {
        if (!selectedSize) return "Không có kích cỡ";
        return `${selectedSize.name} (${selectedSize.priceSize.toLocaleString("vi-VN")} VNĐ
      )`;
      },
    },
    {
      title: "Topping",
      dataIndex: "product_toppings",
      key: "topping",
      render: (productToppings) => {
        if (!productToppings || !productToppings.length)
          return "Không có topping";
        return productToppings
          .map(
            (item: ProductTopping) =>
              `${item.topping_id.priceTopping.toLocaleString("vi-VN")} VNĐ`
          )
          .join(", ");
      },
    },

    {
      title: "Giá",
      key: "price",
      render: (_: string, record) => {
        const salePrice = record.product_id.price || null;
        return salePrice
          ? `${salePrice.toLocaleString("vi-VN")} VNĐ`
          : "Không giảm giá";
      },
    },
    {
      title: "Giá sale",
      key: "sale_price",
      render: (_: string, record) => {
        const salePrice = record.product_id.sale_price || null;
        return salePrice
          ? `${salePrice.toLocaleString("vi-VN")} VNĐ`
          : "Không giảm giá";
      },
    },
    {
      title: "Voucher",
      key: "voucher",
      render: () => (
        <div>
          {order.discountAmount ? (
            `${order.discountAmount.toLocaleString("vi-VN")} VNĐ`
          ) : (
            <span>Không giảm giá</span>
          )}
        </div>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Thành tiền",
      key: "total_price",
      render: (_: string, record) => {
        const originalPrice = record.product_id.price || 0;
        const salePrice = record.product_id.sale_price || originalPrice;
        const selectedSizePrice = record.product_size?.priceSize || 0; // Giá size
        const toppingPrice =
          record.product_toppings?.reduce((sum, item: ProductTopping) => {
            return sum + (item.topping_id.priceTopping || 0); // Giá của từng topping
          }, 0) || 0;
        const quantity = record.quantity || 0;
        const discountAmount = order.discountAmount || 0; // Lấy discountAmount từ order nếu có

        // Tính tổng giá trị chưa giảm giá
        const totalPriceWithoutDiscount =
          (salePrice + selectedSizePrice + toppingPrice) * quantity;

        // Tính tổng giá trị sau khi trừ giảm giá
        const totalPrice = totalPriceWithoutDiscount - discountAmount;

        return totalPrice > 0 // Đảm bảo giá trị không âm
          ? `${totalPrice.toLocaleString("vi-VN")} VNĐ`
          : "Không áp dụng giảm giá";
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
        description={`Không tìm thấy đơn hàng nào`}
        type="error"
        showIcon
      />
    );
  }
  return (
    <div className="h-screen overflow-y-auto bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 max-h-[78vh]">
      {contextHolder}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Title level={3} className="text-2xl font-bold text-gray-900 ml-4">
            Chi tiết đơn hàng #{order.orderNumber}
          </Title>
          <Link to={`/admin/order`}>
            <button className="flex items-center text-gray-600 hover:text-gray-900 transition duration-300 transform hover:scale-105 hover:translate-x-1">
              <ArrowLeftOutlined className="h-5 w-5 mr-2" />
              <span className="font-medium">Quay lại</span>
            </button>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông tin đơn hàng
                </h2>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 flex items-center">
                    <FontAwesomeIcon
                      icon={faReceipt}
                      className="mr-2 text-gray-500"
                    />
                    Mã đơn hàng:{" "}
                    <span className="font-medium text-gray-900">
                      #{order.orderNumber}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="mr-2 text-gray-500"
                    />
                    Ngày đặt hàng:{" "}
                    <span className="font-medium text-gray-900 ml-2">
                      {new Date(order.createdAt).toLocaleString("vi-VN")}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <FontAwesomeIcon
                      icon={faClock}
                      className="mr-2 text-gray-500"
                    />
                    Ngày cập nhật:{" "}
                    <span className="font-medium text-gray-900 ml-2">
                      {new Date(order.updatedAt).toLocaleString("vi-VN")}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <FontAwesomeIcon
                      icon={faMoneyBillWave}
                      className="mr-2 text-gray-500"
                    />
                    Tổng đơn hàng:{" "}
                    <span className="font-medium text-gray-900 ml-2">
                      {formatPrice(order.totalPrice)}
                    </span>
                  </p>

                  <p className="text-sm text-gray-600 flex items-center">
                    <FontAwesomeIcon
                      icon={faStickyNote}
                      className="mr-2 text-gray-500"
                    />
                    Ghi chú:
                    <span className="font-medium text-gray-900 ml-2">
                      {order.note ? order.note : "Không có ghi chú"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông tin khách hàng
                </h2>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 flex items-center">
                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                    Tên khách hàng:{" "}
                    <span className="font-medium text-gray-900">
                      {order.customerInfo?.name || "N/A"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                    Email:{" "}
                    <span className="font-medium text-gray-900">
                      {order.customerInfo?.email || "N/A"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                    Địa chỉ:{" "}
                    <span className="font-medium text-gray-900">
                      {order.customerInfo?.address || "N/A"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                    Phương thức thanh toán:{" "}
                    <span
                      className={`ml-2 font-medium ${
                        {
                          momo: "text-pink-500",
                          zalopay: "text-green-500",
                          vnpay: "text-blue-600",
                          "cash on delivery": "text-gray-700",
                        }[order.paymentMethod] || "text-gray-900"
                      }`}
                    >
                      {paymentMethodDisplay(order.paymentMethod)}
                    </span>
                  </p>

                  {["momo", "zalopay", "vnpay", "cash on delivery"].includes(
                    order.paymentMethod
                  ) &&
                    order.paymentStatus && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 flex items-center">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="mr-2"
                          />
                          Trạng thái thanh toán:
                          <span
                            className={`font-medium ml-1 ${
                              {
                                pending: "text-yellow-500",
                                unpaid: "text-red-500",
                                paid: "text-green-600",
                                failed: "text-red-600",
                              }[order.paymentStatus] || "text-gray-900"
                            }`}
                          >
                            {order.orderStatus === "delivered" ||
                            order.orderStatus === "completed"
                              ? " Đã Thanh Toán "
                              : paymentStatusDisplay(order.paymentStatus)}
                          </span>
                        </p>

                        {/* Hiển thị dropdown nếu trạng thái đơn hàng chưa hoàn tất và paymentMethod không phải momo hoặc zaloPay */}
                        {order.orderStatus !== "completed" &&
                        order.orderStatus !== "canceled" &&
                        order.orderStatus !== "delivered" &&
                        order.paymentMethod !== "momo" &&
                        order.paymentMethod !== "zalopay" &&
                        order.paymentMethod !== "vnpay" ? (
                          <div className="mt-4">
                            <label
                              htmlFor="paymentStatus"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Chọn trạng thái thanh toán
                            </label>
                            <select
                              className="mt-2 p-2 border rounded"
                              value={order.paymentStatus}
                              onChange={(e) =>
                                handleChangePaymentStatus(e.target.value)
                              }
                            >
                              {paymentStatusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {paymentStatusDisplay(option.value)}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          ""
                        )}
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
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

        {/* Order Status */}
        <div className="p-6 bg-white shadow-md rounded-md mb-6 transition duration-300 hover:shadow-lg hover:bg-gray-50">
          <p className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">
              Trạng thái:
            </span>
            <Select
              className="w-40"
              value={orderState?.orderStatus}
              onChange={(newStatus) =>
                handleStatusChange(newStatus as OrderStatus, orderState!)
              }
              disabled={["completed", "canceled"].includes(
                orderState?.orderStatus || ""
              )}
            >
              {Object.entries(OrderStatusLabels).map(([key, label]) => (
                <Select.Option key={key} value={key}>
                  <span
                    className={`font-semibold px-2 py-1 rounded-md block w-full ${getStatusColor(
                      key as OrderStatus
                    )} ${
                      ["completed", "canceled"].includes(key)
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {label}
                  </span>
                </Select.Option>
              ))}
            </Select>
          </p>

          {/* Hiển thị nút "Hủy đơn hàng" chỉ khi trạng thái là "pending" hoặc "confirmed", và không phải thanh toán qua momo/zalopay đã thanh toán */}
          {["pending", "confirmed"].includes(orderState?.orderStatus || "") &&
            !(
              ["momo", "zalopay", "vnpay"].includes(
                orderState?.paymentMethod
              ) && orderState?.paymentStatus === "paid"
            ) && (
              <div className="mt-4">
                <Button
                  key="submit"
                  type="primary"
                  className="bg-red-500"
                  onClick={() => handleCancelOrder(order)}
                >
                  Hủy đơn
                </Button>
              </div>
            )}

          {order.orderStatus === "canceled" && // Changed from selectedOrder to order
            order.cancellationReason && ( // Changed from selectedOrder to order
              <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-red-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h4 className="text-lg font-semibold text-red-700">
                    Đơn hàng bị hủy
                  </h4>
                </div>
                <p className="mt-2 text-gray-700">
                  <strong className="font-medium">Lý do hủy: </strong>
                  {order.cancellationReason || "Chưa có lý do hủy"}{" "}
                  {/* Changed from selectedOrder to order */}
                </p>
              </div>
            )}
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Chi tiết sản phẩm
          </h2>
          <div className="overflow-x-auto">
            <Table
              columns={itemColumns}
              dataSource={order.orderDetail_id || order.discountAmount}
              pagination={false}
              rowKey="_id"
              className="min-w-full"
              scroll={{ x: true }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
