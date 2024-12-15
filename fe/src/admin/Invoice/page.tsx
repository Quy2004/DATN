import React, { useEffect, useMemo, useState } from "react";
import { Table, Tag, Result, Button, Tooltip, Input, Space } from "antd";
import instance from "../../services/api";
import { useNavigate } from "react-router-dom";
import Title from "antd/es/typography/Title";
import {
  DownloadOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { Slider } from "antd";
import * as XLSX from "xlsx";
interface Product {
  _id: string;
  name: string;
  price: number;
  sale_price: number;
  discount: number;
  image: string;
  status: string;
}

interface OrderDetail {
  _id: string;
  order_id: string;
  product_id: Product;
  quantity: number;
  price: number;
  sale_price: number;
  image: string;
  product_size: string;
  product_toppings: Array<{ _id: string; topping_id: string }>;
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  userName: string;
  email: string;
}

interface Order {
  _id: string;
  customerInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  user_id: User;
  totalPrice: number;
  orderStatus: string;
  paymentStatus: string;
  orderDetail_id: OrderDetail[];
  paymentMethod: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  orderNumber: string;
}

const InvoiceManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const [, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateRange, setDateRange] = useState<
    [moment.Moment | null, moment.Moment | null]
  >([null, null]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await instance.get("/orders/invoice/order");
        setOrders(response.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);
  const handleRowClick = (order: Order) => {
    navigate("/admin/invoice-detail", { state: { order } });
  };

  const filterOrders = (orders, searchTerm, dateRange, priceRange) => {
    let result = [...orders]; // Create a copy of the orders array

    // Filter by search term
    if (searchTerm) {
      // Trim the search term and replace multiple spaces with a single space
      const cleanedSearchTerm = searchTerm
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();

      result = result.filter(
        (order) =>
          // Trim and normalize order number before comparison
          order.orderNumber.trim().toLowerCase().replace(/\s+/g, " ") ===
            cleanedSearchTerm ||
          // Check if order number includes the cleaned search term
          order.orderNumber
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ")
            .includes(cleanedSearchTerm) ||
          // Similar normalization for other searchable fields
          order.customerInfo?.name
            ?.trim()
            .toLowerCase()
            .replace(/\s+/g, " ")
            .includes(cleanedSearchTerm) ||
          order.customerInfo?.phone
            ?.trim()
            .toLowerCase()
            .replace(/\s+/g, " ")
            .includes(cleanedSearchTerm) ||
          // For product names, check if any product matches
          order.orderDetail_id.some((detail) =>
            detail.product_id.name
              .trim()
              .toLowerCase()
              .replace(/\s+/g, " ")
              .includes(cleanedSearchTerm)
          )
      );
    }

    // Rest of the function remains the same
    // Filter by date range
    if (dateRange[0] && dateRange[1]) {
      const [startDate, endDate] = dateRange;
      result = result.filter((order) => {
        const orderDate = moment(order.createdAt);
        return orderDate.isBetween(startDate, endDate, "day", "[]");
      });
    }

    // Filter by price range
    if (priceRange[0] !== 0 || priceRange[1] !== 1000000) {
      result = result.filter(
        (order) =>
          order.totalPrice >= priceRange[0] && order.totalPrice <= priceRange[1]
      );
    }

    return result;
  };

  // Memoized filtered orders to avoid recalculating on every render
  const filteredOrders = useMemo(
    () => filterOrders(orders, searchTerm, dateRange, priceRange),
    [orders, searchTerm, dateRange, priceRange]
  );
  const exportToExcel = () => {
    const exportData = filteredOrders.map((order, index) => {
      let paymentMethodInVietnamese = "N/A";

      switch (order.paymentMethod) {
        case "cash on delivery":
          paymentMethodInVietnamese = "Thanh toán khi nhận hàng";
          break;
        case "momo":
          paymentMethodInVietnamese = "MOMO";
          break;
        case "zalopay":
          paymentMethodInVietnamese = "ZaloPay";
          break;
        case "vnpay":
          paymentMethodInVietnamese = "VNPAY";
          break;
        default:
          paymentMethodInVietnamese = "N/A";
          break;
      }

      return {
        STT: index + 1,
        "Mã Hóa Đơn": order.orderNumber,
        "Tên Khách Hàng": order.customerInfo?.name || "N/A",
        "Số Điện Thoại": order.customerInfo?.phone || "N/A",
        "Ngày Tạo": moment(order.createdAt).format("DD/MM/YYYY"),
        "Tổng Giá": `${order.totalPrice.toLocaleString()} đ`,
        "Trạng Thái":
          order.orderStatus === "completed" ? "Hoàn thành" : order.orderStatus,
        "Ghi Chú": order.note || "",
        "Phương Thức Thanh Toán": paymentMethodInVietnamese,
        Email: order.customerInfo?.email || "N/A",
        "Địa Chỉ": order.customerInfo?.address || "N/A",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh Sách Hóa Đơn");

    XLSX.writeFile(
      workbook,
      `Danh_Sach_Hoa_Don_${moment().format("DDMMYYYY")}.xlsx`
    );
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 70,
      render: (_: string, record: Order, index: number) => index + 1,
    },
    {
      title: "Mã Hóa Đơn",
      dataIndex: "orderNumber",
      key: "orderNumber",
      ellipsis: true,
    },
    {
      title: "Tên Khách Hàng",
      dataIndex: "customerInfo",
      key: "name",
      ellipsis: true,
      render: (customerInfo: Order["customerInfo"]) =>
        customerInfo?.name || "N/A",
    },
    {
      title: "Số Điện Thoại",
      dataIndex: "customerInfo",
      key: "phone",
      ellipsis: true,
      render: (customerInfo: Order["customerInfo"]) =>
        customerInfo?.phone || "N/A",
    },
    {
      title: "Ngày Tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      ellipsis: true,
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Tổng Giá",
      dataIndex: "totalPrice",
      key: "totalPrice",
      ellipsis: true,
      render: (text: number) => `${text.toLocaleString()} đ`,
    },
    {
      title: "Trạng Thái",
      dataIndex: "orderStatus",
      key: "orderStatus",
      ellipsis: true,
      render: (text: string) => {
        if (text === "completed") {
          return <Tag color="green">Hoàn thành</Tag>;
        }
        return text;
      },
    },
    {
      key: "actions",
      ellipsis: true,
      render: (_: string, record: Order) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleRowClick(record)}
          ></Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between">
        <Title level={3} className="text-2xl font-semibold text-gray-800 mb-4">
          Danh sách hóa đơn
        </Title>
        <Space>
          {/* Tìm kiếm */}
          <div className="">
            <Input
              placeholder="Nhập mã HĐ, tên KH, SĐT hoặc tên SP"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
              className="w-[250px]"
            />
          </div>
          {/* Khoảng giá */}
          <div className="ml-5">
            <Slider
              className="w-[200px]"
              range
              value={priceRange}
              onChange={(values) => setPriceRange(values)}
              min={0}
              max={500000}
              step={10000}
              marks={{
                0: "0đ",
                250000: "250k",
                500000: "500k",
              }}
            />
          </div>
        </Space>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={exportToExcel}
          disabled={filteredOrders.length === 0}
        >
          Xuất Excel
        </Button>
      </div>
      {filteredOrders.length === 0 && orders.length > 0 ? (
        <div className="flex justify-center items-center p-6">
          <Result
            status="warning"
            title="Không tìm thấy kết quả phù hợp"
            subTitle="Vui lòng thử lại với các tiêu chí lọc khác."
          />
        </div>
      ) : (
        <Table
          className="mt-5 bg-white rounded-lg shadow-sm"
          dataSource={filteredOrders.length > 0 ? filteredOrders : orders}
          columns={columns}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
          scroll={{ x: "max-content", y: 340 }}
        />
      )}
    </div>
  );
};

export default InvoiceManagement;
