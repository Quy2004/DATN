import React, { useEffect, useState } from "react";
import {
  Table,
  Spin,
  Tag,
  Result,
  Typography,
  Button,
  Tooltip,
  Input,
  Space,
} from "antd";

import instance from "../../services/api";
import { useNavigate } from "react-router-dom";
import Title from "antd/es/typography/Title";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import moment from "moment";

import { DatePicker, Slider } from "antd";
import type { RangeValue } from "rc-picker/lib/interface";
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
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateRange, setDateRange] = useState<
    [moment.Moment | null, moment.Moment | null]
  >([null, null]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]); // Adjust max price as needed
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

  useEffect(() => {
    const filterOrders = () => {
      let result = [...orders]; // Tạo bản sao của danh sách đơn hàng

      // Lọc theo từ khóa tìm kiếm
      if (searchTerm) {
        const lowerCaseTerm = searchTerm.toLowerCase();
        result = result.filter(
          (order) =>
            order.orderNumber.toLowerCase().includes(lowerCaseTerm) || // Mã hóa đơn
            order.customerInfo?.name?.toLowerCase().includes(lowerCaseTerm) || // Tên khách hàng
            order.customerInfo?.phone?.toLowerCase().includes(lowerCaseTerm) || // Số điện thoại
            order.orderDetail_id.some(
              (detail) =>
                detail.product_id.name.toLowerCase().includes(lowerCaseTerm) // Tên sản phẩm
            )
        );
      }

      // Lọc theo khoảng thời gian
      if (dateRange[0] && dateRange[1]) {
        const [startDate, endDate] = dateRange;
        result = result.filter((order) => {
          const orderDate = moment(order.createdAt);
          return orderDate.isBetween(startDate, endDate, "day", "[]");
        });
      }

      // Lọc theo khoảng giá
      if (priceRange[0] !== 0 || priceRange[1] !== 1000000) {
        result = result.filter(
          (order) =>
            order.totalPrice >= priceRange[0] &&
            order.totalPrice <= priceRange[1]
        );
      }

      setFilteredOrders(result);
    };

    filterOrders();
  }, [searchTerm, dateRange, priceRange, orders]);

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 70,
      render: (_: string, record: Order, index: number) => index + 1, // index + 1 để bắt đầu từ 1
    },
    {
      title: "Mã Hóa Đơn",
      dataIndex: "orderNumber",
      key: "orderNumber",
      ellipsis: true, // Thêm thuộc tính ellipsis
    },
    {
      title: "Tên Khách Hàng",
      dataIndex: "customerInfo",
      key: "name",
      ellipsis: true, // Thêm thuộc tính ellipsis
      render: (customerInfo: Order["customerInfo"]) =>
        customerInfo?.name || "N/A",
    },
    {
      title: "Số Điện Thoại",
      dataIndex: "customerInfo",
      key: "phone",
      ellipsis: true, // Thêm thuộc tính ellipsis
      render: (customerInfo: Order["customerInfo"]) =>
        customerInfo?.phone || "N/A",
    },
    {
      title: "Ngày Tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      ellipsis: true, // Thêm thuộc tính ellipsis
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Tổng Giá",
      dataIndex: "totalPrice",
      key: "totalPrice",
      ellipsis: true, // Thêm thuộc tính ellipsis
      render: (text: number) => `${text.toLocaleString()} đ`,
    },
    {
      title: "Trạng Thái",
      dataIndex: "orderStatus",
      key: "orderStatus",
      ellipsis: true, // Thêm thuộc tính ellipsis
      render: (text: string) => {
        if (text === "completed") {
          return <Tag color="green">Hoàn thành</Tag>;
        }
        return text;
      },
    },
    {
      key: "actions",
      ellipsis: true, // Thêm thuộc tính ellipsis
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
      <div className="flex">
        <Title level={3} className="text-2xl font-semibold text-gray-800 mb-4">
          Danh sách hóa đơn
        </Title>
        <Space>
          {" "}
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
          <div>
            <Slider
              className="w-[200px]"
              range
              value={priceRange}
              onChange={(values) => setPriceRange(values)}
              min={0}
              max={100000}
              step={2}
              marks={{
                0: "0đ",
                50000: "50k",
                100000: "100k",
              }}
            />
          </div>
        </Space>
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
          scroll={{ x: "max-content", y: 380 }}
        />
      )}
    </div>
  );
};

export default InvoiceManagement;
