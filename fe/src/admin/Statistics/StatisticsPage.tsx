import React, { useEffect, useState } from "react";
import { Card, List, Row, Col, Typography, Select, DatePicker } from "antd";
import { Bar, Line, Pie } from "react-chartjs-2";

import instance from "../../services/api";
import {
  CheckCircleOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";

// Register ChartJS modules
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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

  const stats = [
    {
      title: "Tổng doanh thu",
      value: data?.totalRevenue,
      formatter: (value) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(value),
      icon: <DollarOutlined className="text-green-500" />,
    },
    {
      title: "Tổng đơn hàng",
      value: data?.totalOrders,
      icon: <ShoppingCartOutlined className="text-blue-500" />,
    },
    {
      title: "Số lượng khách hàng",
      value: data?.totalUser,
      icon: <UserOutlined className="text-purple-500" />,
    },
    {
      title: "Đơn hàng thành công",
      value: data?.successfulOrders,
      icon: <CheckCircleOutlined className="text-emerald-500" />,
    },
  ];

  const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const ordersByDayData = {
    labels: data?.ordersByDayOfWeek?.map((item) => daysOfWeek[item._id - 1]),
    datasets: [
      {
        label: "Số đơn theo ngày",
        data: data?.ordersByDayOfWeek?.map((item) => item.count),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
  };

  const paymentMethodData = {
    labels: data?.paymentMethodStats?.map((item) => {
      switch (item._id) {
        case "momo":
          return "MoMo";
        case "zalopay":
          return "ZaloPay";
        case "vnpay":
          return "VNPay";
        case "cash on delivery":
          return "Thanh toán khi nhận hàng";
        default:
          return item._id;
      }
    }),
    datasets: [
      {
        data: data?.paymentMethodStats?.map((item) => item.count),
        backgroundColor: [
          "rgba(170, 0, 97, 0.7)",
          "rgba(0, 134, 248, 0.7)",
          "rgba(0, 164, 180, 0.7)",
          "rgba(76, 175, 80, 0.7)",
        ],
        borderColor: [
          "rgba(170, 0, 97, 1)",
          "rgba(0, 134, 248, 1)",
          "rgba(0, 164, 180, 1)",
          "rgba(76, 175, 80, 1)",
        ],
        borderWidth: 1,
      },
    ],
    options: {
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 20,
            usePointStyle: true,
          },
        },
      },
    },
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg shadow-md p-5 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-2">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stat.formatter
                    ? stat.formatter(stat.value)
                    : stat.value?.toLocaleString() || 0}
                </p>
              </div>
              <div className="text-3xl opacity-70">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Đơn hàng theo ngày</h3>
          <Bar data={ordersByDayData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Phương thức thanh toán</h3>
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Chart */}
            <div className="w-full md:w-1/2">
              <div className="h-[300px] flex items-center justify-center">
                <Pie
                  data={paymentMethodData}
                  options={paymentMethodData.options}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="w-full md:w-1/2">
              <div className="space-y-4">
                {data?.paymentMethodStats?.map((method) => {
                  const totalAmount = data.paymentMethodStats.reduce(
                    (sum, item) => sum + item.totalAmount,
                    0
                  );
                  const percentage = (
                    (method.totalAmount / totalAmount) *
                    100
                  ).toFixed(1);

                  return (
                    <div
                      key={method._id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:shadow-sm transition-all"
                    >
                      <div>
                        <span className="font-medium">
                          {method._id === "momo" && "MoMo"}
                          {method._id === "zalopay" && "ZaloPay"}
                          {method._id === "vnpay" && "VNPay"}
                          {method._id === "cash on delivery" &&
                            "Thanh toán khi nhận hàng"}
                        </span>
                        <div className="text-sm text-gray-500">
                          {method.count} đơn hàng
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
    pending: "Chờ Xác Nhận",
    confirmed: "Đã Xác Nhận",
    shipping: "Đang Giao Hàng",
    delivered: "Đã Giao Hàng",
    completed: "Hoàn Thành",
    canceled: "Đã Hủy",
  };

  return (
    <Card
      title="Thống kê trạng thái đơn hàng"
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
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const res = await getTopProducts();
        setData(res.data.data);
      } catch (error) {
        console.error("Error fetching top products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
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
        width: "500px",
        marginLeft: "20px",
      }}
    >
      {" "}
      <List
        dataSource={data}
        renderItem={(item) => (
          <div className="flex mb-5">
            {" "}
            <img
              src={item.productImage}
              alt={item.productName}
              style={{ width: "80px", height: "80px", borderRadius: "8px" }}
            />{" "}
            <div className="ml-9">
              {" "}
              <strong style={{ fontSize: "16px" }}>
                {item.productName}
              </strong>{" "}
              <p style={{ margin: 0 }}>
                {" "}
                {item.originalPrice === item.salePrice ? (
                  <span>Giá: {formatCurrency(item.salePrice)}</span>
                ) : (
                  <>
                    {" "}
                    Giá gốc:{" "}
                    <span
                      style={{
                        textDecoration: "line-through",
                        marginRight: "5px",
                      }}
                    >
                      {" "}
                      {formatCurrency(item.originalPrice)}{" "}
                    </span>{" "}
                    Giá giảm: {formatCurrency(item.salePrice)} (Giảm:{" "}
                    {item.discount}%){" "}
                  </>
                )}{" "}
              </p>{" "}
              <p style={{ margin: 0 }}>Đã bán: {item.totalQuantity}</p>{" "}
            </div>{" "}
          </div>
        )}
      />{" "}
      {data.length === 0 && !loading && <p>Không có dữ liệu để hiển thị.</p>}{" "}
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
    labels: data.map((item) => item._id), // X-axis labels: ngày/tháng/năm
    datasets: [
      {
        label: "Doanh thu", // Tiêu đề của đường biểu đồ
        data: data.map((item) => item.totalRevenue), // Dữ liệu doanh thu
        borderColor: "rgba(75, 192, 192, 1)", // Màu sắc đường
        backgroundColor: "rgba(75, 192, 192, 0.2)", // Màu nền cho biểu đồ
        fill: true, // Đổ màu nền dưới đường (nếu cần)
        tension: 0.4, // Độ cong của đường (0 là đường thẳng, giá trị cao hơn sẽ tạo độ cong)
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
        <Line data={chartData} options={{ responsive: true }} />{" "}
        {/* Biểu đồ đường */}
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
      className="space-y-6"
    >
      <OrderStats />
      <Row>
        <Col xs={12}>
          <RevenueByTime
            style={{
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              borderRadius: "12px",
              transition: "transform 0.3s ease",
            }}
            className="hover:scale-[1.01]"
          />
        </Col>
        <Col xs={24} lg={8}>
          <TopProducts
            style={{
              height: "100%",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              borderRadius: "12px",
              transition: "transform 0.3s ease",
            }}
            className="hover:scale-[1.02] "
          />
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={8}>
          <CustomerStats
            style={{
              height: "100%",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              borderRadius: "12px",
              transition: "transform 0.3s ease",
            }}
            className="hover:scale-[1.02]"
          />
        </Col>
        <Col xs={24} md={12} lg={8}>
          <OrderStatusDistribution
            style={{
              height: "100%",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              borderRadius: "12px",
              transition: "transform 0.3s ease",
            }}
            className="hover:scale-[1.02]"
          />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
