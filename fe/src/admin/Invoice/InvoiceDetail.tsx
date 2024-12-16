import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, Col, Image, Row, Table, Tag, Typography, Button } from "antd";
import { Product, ProductTopping } from "../../types/product";
import { Order } from "../../types/order";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Title } = Typography;

const InvoiceDetail: React.FC = () => {
  const location = useLocation();
  const { order } = location.state || {};
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (order) {
      setSelectedOrder(order);
    }
  }, [order]);

  if (!order) {
    return <div>Không tìm thấy thông tin hóa đơn.</div>;
  }
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      currencyDisplay: "code", 
    })
      .format(price)
      .replace("VND", "VNĐ");
  };

  const paymentStatusDisplay = (status: string) => {
    switch (status) {
      case "pending":
        return "Đang chờ xử lí";
      case "paid":
        return "Đã Thanh Toán";
      case "failed":
        return "Thanh Toán Thất Bại";
    }
  };
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
        return `${selectedSize.name} (${selectedSize.priceSize.toLocaleString("vi-VN")} VNĐ)`;
      },
    },
    {
      title: "Topping",
      dataIndex: "product_toppings",
      key: "topping",
      render: (productToppings: ProductTopping[]) => {
        if (!productToppings || !productToppings.length)
          return "Không có topping";

        const toppings = productToppings.map((item: ProductTopping) => {
          const toppingName = item.topping_id.nameTopping;
          const toppingPrice = item.topping_id.priceTopping;
          return `${toppingName} (${formatPrice(toppingPrice)})`;
        });

        return toppings.join(", ");
      },
    },

    {
      title: "Giá",
      key: "sale_price",
      render: (_: string, record) => {
        const salePrice = record.product_id.sale_price || null;
        return salePrice
          ? `${salePrice.toLocaleString("vi-VN")} VNĐ`
          : "Không giảm giá";
      },
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
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

        // Tính tổng tiền trước khi áp dụng voucher
        let totalPrice =
          (salePrice + selectedSizePrice + toppingPrice) * quantity;

        // Lấy giá trị voucher
        const voucherAmount = order.discountAmount || 0;

        // Trừ đi giá trị voucher nếu có
        totalPrice = totalPrice - voucherAmount;

        return `${totalPrice.toLocaleString("vi-VN")} VNĐ`
      },
    },
  ];

  return (
    <div
      className="max-w-6xl h-[750px]"
      style={{ maxHeight: "75vh", overflowY: "auto" }}
    >
      <div style={{ marginTop: 20 }}>
        <Title level={3} className="text-2xl font-semibold text-gray-800 mb-4">
          Chi tiết hóa đơn
        </Title>

        <div className="relative max-w-6xl">
          {/* Nút Quay lại */}
          <Link to={`/admin/invoice`}>
            <button className="flex items-center text-gray-600 hover:text-gray-900 transition duration-300 transform hover:scale-105 hover:translate-x-1 absolute top-[-65px] right-0">
              <ArrowLeftOutlined className="h-5 w-5" />
              <span className="font-medium mr-8">Quay lại</span>
            </button>
          </Link>

          <Card title="Thông Tin Hóa Đơn" bordered>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <p>
                  <strong>Mã Hóa Đơn:</strong> {order.orderNumber}
                </p>
              </Col>
              <Col span={12}>
                <p>
                  <strong>Tên Khách Hàng:</strong> {order.customerInfo.name}
                </p>
              </Col>
              <Col span={12}>
                <p>
                  <strong>Email:</strong> {order.customerInfo.email}
                </p>
              </Col>
              <Col span={12}>
                <p>
                  <strong>Số Điện Thoại:</strong> {order.customerInfo.phone}
                </p>
              </Col>
              <Col span={12}>
                <p>
                  <strong>Địa Chỉ:</strong> {order.customerInfo.address}
                </p>
              </Col>
              <Col span={12}>
                <p>
                  <strong>Ngày Tạo:</strong>{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </Col>
              <Col span={12}>
                <p>
                  <strong>Tổng Giá:</strong>{" "}
                  {(
                    selectedOrder?.orderDetail_id?.reduce((sum, record) => {
                      const originalPrice = record.product_id.price || 0;
                      const salePrice =
                        record.product_id.sale_price || originalPrice;
                      const selectedSizePrice =
                        record.product_size?.priceSize || 0;
                      const toppingPrice =
                        record.product_toppings?.reduce(
                          (toppingSum, item) =>
                            toppingSum + (item.topping_id.priceTopping || 0),
                          0
                        ) || 0;
                      const quantity = record.quantity || 0;

                      // Tính tổng tiền của một sản phẩm
                      return (
                        sum +
                        (salePrice + selectedSizePrice + toppingPrice) *
                          quantity
                      );
                    }, 0) - (selectedOrder?.discountAmount || 0)
                  ) // Trừ giá trị voucher
                    .toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).replace("₫", "VNĐ")}
                </p>
              </Col>

              <Col span={12}>
                <p>
                  <strong>Trạng Thái Đơn Hàng:</strong>{" "}
                  <Tag color="green-inverse">
                    {order.orderStatus === "completed"
                      ? "Hoàn thành"
                      : order.orderStatus}
                  </Tag>
                </p>
              </Col>
              <Col span={14}>
                <p>
                  <strong>Phương Thức Thanh Toán:</strong>{" "}
                  <span
                    className={`font-medium ${
                      {
                        "cash on delivery": "text-gray-700",
                        momo: "text-pink-500",
                        zalopay: "text-green-500",
                        vnpay: "text-blue-600",
                      }[order.paymentMethod] || "text-gray-400"
                    }`}
                  >
                    {order.paymentMethod === "cash on delivery"
                      ? "Thanh toán khi nhận hàng"
                      : order.paymentMethod === "momo"
                      ? " MoMo"
                      : order.paymentMethod === "zalopay"
                      ? " ZaloPay"
                      : order.paymentMethod === "vnpay"
                      ? " VNPay"
                      : "Không xác định"}
                  </span>{" "}
                  - Trạng thái:{" "}
                  <span
                    className={`font-medium ${
                      {
                        pending: "text-yellow-500",
                        unpaid: "text-red-500",
                        paid: "text-green-600",
                        failed: "text-red-600",
                      }[order.paymentStatus] || "text-gray-500"
                    }`}
                  >
                    {paymentStatusDisplay(order.paymentStatus)}
                  </span>
                </p>
              </Col>
            </Row>
          </Card>
        </div>
        <Title level={5} style={{ marginTop: 20 }}>
          Chi Tiết Sản Phẩm:
        </Title>
        <Table
          columns={itemColumns}
          dataSource={selectedOrder?.orderDetail_id || []}
          pagination={false}
          rowKey="_id"
          className="border border-gray-200 rounded-md shadow-md"
          style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}
        />
      </div>
    </div>
  );
};

export default InvoiceDetail;
