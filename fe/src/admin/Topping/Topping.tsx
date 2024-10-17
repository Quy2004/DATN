import React from "react";
import { useQuery } from "@tanstack/react-query";
import instance from "../../services/api";
import { Alert, Spin, Table, Tag } from "antd";
import { Topping } from "../../types/product";
import Title from "antd/es/typography/Title";

const ToppingManagerPage = () => {
  const {
    data: toppings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["toppings"],
    queryFn: async () => {
      const response = await instance.get(`toppings`);
      return response.data.data;
    },
  });

  const dataSource = toppings?.map((item: Topping) => ({
    key: item._id, // Sử dụng _id làm key
    ...item,
  }));

  const columns = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      render: (text: string, record: Topping, index: number) => index + 1,
    },
    {
      title: "Tên Topping",
      dataIndex: "nameTopping",
      key: "nameTopping",
    },
    {
      title: "Giá Topping",
      dataIndex: "priceTopping",
      key: "priceTopping",
      render: (price: number) => `${price.toLocaleString("vi-VN")} VND`,
    },
    {
      title: "Trạng Thái",
      dataIndex: "statusTopping",
      key: "statusTopping",
      render: (status: string) => (
        <Tag color={status === "available" ? "green" : "red"}>
          {status === "available" ? "Có sẵn" : "Hết hàng"}
        </Tag>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Spin tip="Đang tải dữ liệu..." size="large" />
      </div>
    );
  }

  if (error instanceof Error) {
    return (
      <div style={{ padding: "20px" }}>
        <Alert
          message="Có lỗi xảy ra"
          description={error.message}
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (!toppings || toppings.length === 0) {
    return (
      <div className="p-6 text-center">
        <div
          className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4"
          role="alert"
        >
          <p className="font-bold">Không có topping nào.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <Title level={3}>Danh sách Topping</Title>
      </div>
      <Table columns={columns} dataSource={dataSource} rowKey="_id" />
    </>
  );
};

export default ToppingManagerPage;
