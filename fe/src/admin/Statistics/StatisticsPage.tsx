import React, { useEffect, useState } from "react";
import { Card, List, Row, Col, Typography, Spin, Select, DatePicker } from "antd";
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
const { RangePicker } = DatePicker;

// API Calls
const getOrderStats = () => instance.get("/orders/order-stats");
const getOrderStatusDistribution = () =>
  instance.get("/orders/order-status-distribution");
const getTopProducts = () => instance.get("/orders/top-products");
const getCustomerStats = () => instance.get("/orders/customer-stats");
const getRevenueByTime = (period) =>
  instance.get(`/orders/revenue-by-time?period=${period}`);

// Format currency
const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount
  );
// Date Range Component
const DateRangeSelector = ({ onChange, style }) => (
  <RangePicker
    style={style}
    onChange={(dates, dateStrings) => onChange(dateStrings)}
  />
);
// Order Statistics Component
const OrderStats = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    getOrderStats()
      .then((res) => {
        setData(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Card
      title="Thống kê đơn hàng"
      loading={loading}
      style={{ borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
    >
      {data && (
        <>
          <p style={{ fontSize: "18px", fontWeight: "600" }}>
            Tổng số đơn hàng: {data.totalOrders}
          </p>
          <p style={{ fontSize: "18px", fontWeight: "600" }}>
            Tổng doanh thu: {formatCurrency(data.totalRevenue)}
          </p>
        </>
      )}
    </Card>
  );
};

// Order Status Distribution Component
const OrderStatusDistribution = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    getOrderStatusDistribution()
      .then((res) => {
        setData(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statusMap = {
    pending: "Đang chờ",
    completed: "Hoàn thành",
    canceled: "Đã hủy",
    confirmed: "Đã xác nhận",
    delivered: "Đã giao",
  };

  return (
    <Card
      title="Phân phối trạng thái đơn hàng"
      loading={loading}
      style={{ borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
    >
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
  const [data, setData] = useState(null);

  useEffect(() => {
    getTopProducts()
      .then((res) => {
        setData(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Card
      title="Sản phẩm bán chạy"
      loading={loading}
      style={{
        borderRadius: "10px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        maxHeight: "400px",
        overflowY: "auto",
      }}
    >
      <List
        dataSource={data || []}
        renderItem={(item) => (
          <List.Item className="flex items-center space-x-4 p-4 border-b">
            <img
              src={item.product.image}
              alt={item.product.name}
              style={{ width: "80px", height: "80px", borderRadius: "8px" }}
            />
            <div>
              <strong style={{ fontSize: "16px" }}>{item.product.name}</strong>
              <p style={{ margin: 0 }}>
                Giá: {formatCurrency(item.product.sale_price)} (Giảm giá:{" "}
                {item.product.discount}%)
              </p>
              <p style={{ margin: 0 }}>Đã bán: {item.totalQuantity}</p>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
};

// Revenue by Time Component
const RevenueByTime = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState("daily");
  const [dateRange, setDateRange] = useState(["", ""]);

  useEffect(() => {
    const [startDate, endDate] = dateRange;
    getRevenueByTime(period, startDate, endDate)
      .then((res) => {
        setData(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period, dateRange]);

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
    <Card
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Doanh thu theo thời gian</span>
          <div style={{ display: "flex", gap: "10px" }}>
            <Select
              defaultValue="daily"
              onChange={setPeriod}
              options={[
                { value: "daily", label: "Theo ngày" },
                { value: "monthly", label: "Theo tháng" },
              ]}
            />
           
          </div>
        </div>
      }
      loading={loading}
      style={{ borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
    >
      <div style={{ height: "300px" }}>
        <Bar data={chartData} options={{ responsive: true }} />
      </div>
    </Card>
  );
};

// Customer Stats Component
const CustomerStats = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    getCustomerStats()
      .then((res) => {
        setData(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Card
      title="Thống kê khách hàng"
      loading={loading}
      style={{ borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
    >
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
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f0f2f5",
        height: "70vh",
        overflowY: "auto",
      }}
    >
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
    </div>
  );
};

export default Dashboard;
