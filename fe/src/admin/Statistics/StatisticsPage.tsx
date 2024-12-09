import React, { useEffect, useState } from "react";
import { Card, Spin, List, Row, Col, Typography } from "antd";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import instance from "../../services/api";

// Register ChartJS modules
ChartJS.register(CategoryScale, LinearScale, BarElement, Title);

const { Title: AntTitle } = Typography;

// API Calls
const getOrderStats = () => instance.get("/orders/order-stats");
const getOrderStatusDistribution = () =>
  instance.get("/orders/order-status-distribution");
const getTopProducts = () => instance.get("/orders/top-products");
const getCustomerStats = () => instance.get("/orders/customer-stats");
const getRevenueByTime = (period: string) =>
  instance.get(`/orders/revenue-by-time?period=${period}`);

// Format currency
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

// Order Statistics Component
const OrderStats = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    totalOrders: number;
    totalRevenue: number;
  } | null>(null);

  useEffect(() => {
    getOrderStats()
      .then((res) => {
        setData(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Card title="Thống kê đơn hàng" loading={loading}>
      {data && (
        <>
          <p>Tổng số đơn hàng: {data.totalOrders}</p>
          <p>Tổng doanh thu: {formatCurrency(data.totalRevenue)}</p>
        </>
      )}
    </Card>
  );
};

// Order Status Distribution Component
const OrderStatusDistribution = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ _id: string; count: number }[] | null>(
    null
  );

  useEffect(() => {
    getOrderStatusDistribution()
      .then((res) => {
        setData(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statusMap: { [key: string]: string } = {
    pending: "Đang chờ",
    completed: "Hoàn thành",
    canceled: "Đã hủy",
    confirmed: "Đã xác nhận",
    delivered: "Đã giao",
  };

  return (
    <Card title="Phân phối trạng thái đơn hàng" loading={loading}>
      {data?.map((status) => (
        <p key={status._id}>
          {statusMap[status._id] || status._id}: {status.count}
        </p>
      ))}
    </Card>
  );
};

// Top Products Component
const TopProducts = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<
    | {
        _id: string;
        totalQuantity: number;
        product: {
          name: string;
          price: number;
          sale_price: number;
          image: string;
          thumbnail: string[];
          description: string;
          status: string;
          discount: string;
          slug: string;
        };
      }[]
    | null
  >(null);

  useEffect(() => {
    getTopProducts()
      .then((res) => {
        setData(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Card title="Sản phẩm bán chạy" loading={loading}>
      <div style={{ maxHeight: "300px", overflowX: "auto", overflowY: "auto" }}>
        <List
          dataSource={data || []}
          renderItem={(item) => (
            <List.Item className="flex items-center space-x-4 p-4 border-b">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex flex-col">
                <strong className="text-lg font-semibold">
                  {item.product.name}
                </strong>

                <p className="text-gray-600">
                  Giá:{" "}
                  <span className="font-semibold">
                    {item.product.sale_price} VND
                  </span>{" "}
                  (Giảm giá:{" "}
                  <span className="text-red-600">{item.product.discount}%</span>
                  )
                </p>

                <p className="text-gray-600">Đã bán: {item.totalQuantity}</p>
              </div>
            </List.Item>
          )}
        />
      </div>
    </Card>
  );
};

// Revenue by Time Component
const RevenueByTime = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ _id: string; totalRevenue: number }[]>([]);

  useEffect(() => {
    getRevenueByTime("daily")
      .then((res) => {
        setData(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
    <Card title="Doanh thu theo ngày" loading={loading}>
      <div style={{ height: "300px" }}>
        <Bar data={chartData} options={{ responsive: true }} />
      </div>
    </Card>
  );
};

// Customer Stats Component
const CustomerStats = () => {
  const [loading, setLoading] = useState(true);
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
      .then((res) => {
        setData(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Card title="Thống kê khách hàng" loading={loading}>
      <List
        dataSource={data || []}
        renderItem={(item) => (
          <List.Item>
            {item.userName}: {item.orderCount} đơn hàng - Tổng chi tiêu:{" "}
            {formatCurrency(item.totalSpent)}
          </List.Item>
        )}
      />
    </Card>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={12} lg={8}>
        <OrderStats />
      </Col>
      <Col xs={24} md={12} lg={8}>
        <OrderStatusDistribution />
      </Col>
      <Col xs={24} lg={8}>
        <TopProducts />
      </Col>
      <Col xs={24} md={12}>
        <RevenueByTime />
      </Col>
      <Col xs={24} md={12}>
        <CustomerStats />
      </Col>
    </Row>
  );
};

export default Dashboard;
