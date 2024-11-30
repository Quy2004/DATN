import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Typography, Spin, List, Row, Col } from "antd";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import instance from "../../services/api";

// Đăng ký ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title);

// Các hàm gọi API
const getOrderStats = () => instance.get("/orders/order-stats");
const getOrderStatusDistribution = () =>
  instance.get("/orders/order-status-distribution");
const getTopProducts = () => instance.get("/orders/top-products");
const getCustomerStats = () => instance.get("/orders/customer-stats");
const getRevenueByTime = (period: string) =>
  instance.get(`/orders/revenue-by-time?period=${period}`);

// Các thành phần
const OrderStats: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<{
    totalOrders: number;
    totalRevenue: number;
  } | null>(null);

  useEffect(() => {
    getOrderStats()
      .then((response) => {
        setData(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy dữ liệu thống kê đơn hàng:", error);
        setLoading(false);
      });
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="p-5 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-4">Thống kê đơn hàng</h2>
      {loading ? (
        <div className="flex justify-center items-center">
          <span className="text-gray-500">Đang tải...</span>
        </div>
      ) : (
        <div>
          <p className="text-gray-700">Tổng số đơn hàng: {data?.totalOrders}</p>
          <p className="text-gray-700 mt-2">
            Tổng doanh thu: {formatCurrency(data?.totalRevenue ?? 0)}
          </p>
        </div>
      )}
    </div>
  );
};


const OrderStatusDistribution: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<{ _id: string; count: number }[] | null>(
    null
  );

  useEffect(() => {
    getOrderStatusDistribution()
      .then((response) => {
        setData(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(
          "Lỗi khi lấy dữ liệu phân phối trạng thái đơn hàng:",
          error
        );
        setLoading(false);
      });
  }, []);

  // Dịch trạng thái sang tiếng Việt
  const statusTranslations: { [key: string]: string } = {
    pending: "Đang chờ",
    completed: "Đã hoàn thành",
    canceled: "Đã hủy",
    delivered: "Đã giao",
    confirmed: "Đã xác nhận",
  };

  return (
    <div className="p-5 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-4">Phân phối trạng thái đơn hàng</h2>
      {loading ? (
        <div className="flex justify-center items-center">
          <span className="text-gray-500">Đang tải...</span>
        </div>
      ) : (
        <ul className="list-disc list-inside text-gray-700">
          {data?.map((status) => (
            <li key={status._id}>
              Trạng thái: {statusTranslations[status._id] || status._id} - Số
              lượng: {status.count}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


const TopProducts: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<
    | {
        _id: string;
        totalQuantity: number;
        productName: string;
      }[]
    | null
  >(null);

  useEffect(() => {
    getTopProducts()
      .then((response) => {
        setData(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy dữ liệu sản phẩm bán chạy:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-5 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-4">Sản phẩm bán chạy</h2>
      {loading ? (
        <div className="flex justify-center items-center">
          <span className="text-gray-500">Đang tải...</span>
        </div>
      ) : (
        <ul className="list-disc list-inside text-gray-700">
          {data?.map((product) => (
            <li key={product._id}>
              {product.productName}: {product.totalQuantity} đã bán
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const RevenueByTime: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    getRevenueByTime("daily")
      .then((response) => {
        setData(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy dữ liệu doanh thu theo thời gian:", error);
        setLoading(false);
      });
  }, []);

  const chartData = {
    labels: data.map((item) => item._id),
    datasets: [
      {
        label: "Doanh thu",
        data: data.map((item) => item.totalRevenue),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  return (
    <div className="p-5 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-4">Doanh thu theo thời gian</h2>
      {loading ? (
        <div className="flex justify-center items-center">
          <span className="text-gray-500">Đang tải...</span>
        </div>
      ) : (
        <div className="relative h-64">
          <Bar
            data={chartData}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </div>
      )}
    </div>
  );
};

const CustomerStats: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<
    | {
        _id: string;
        userName: string;
        totalSpent: number;
        orderCount: number;
      }[]
    | null
  >(null);

  useEffect(() => {
    getCustomerStats()
      .then((response) => {
        setData(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy dữ liệu khách hàng:", error);
        setLoading(false);
      });
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="p-5 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-4">Thống kê khách hàng</h2>
      {loading ? (
        <div className="flex justify-center items-center">
          <span className="text-gray-500">Đang tải...</span>
        </div>
      ) : (
        <ul className="list-disc list-inside text-gray-700">
          {data?.map((customer) => (
            <li key={customer._id}>
              {customer.userName}: {customer.orderCount} đơn hàng, tổng tiền{" "}
              {formatCurrency(customer.totalSpent)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


const Dashboard: React.FC = () => {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <OrderStats />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <OrderStatusDistribution />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <TopProducts />
        </Col>
        <Col xs={24} sm={12} md={16}>
          <RevenueByTime />
        </Col>
        <Col xs={24} sm={12} md={16}>
          <CustomerStats />
        </Col>
      </Row>
    </div>
  );
};


export default Dashboard;
