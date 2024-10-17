import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import instance from "../../services/api";
import { Alert, Button, message, Popconfirm, Spin, Table, Tag } from "antd";

import Title from "antd/es/typography/Title";
import { Topping } from "../../types/topping";
import { PlusCircleFilled } from "@ant-design/icons";
import { Link } from "react-router-dom";

const ToppingManagerPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();
  const {
    data: toppings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["toppings"],
    queryFn: async () => {
      const response = await instance.get(`toppings`);
      return response.data;
    },
  });
  // Xóa mềm topping
  const mutationSoftDeleteTopping = useMutation<void, Error, string>({
    mutationFn: async (_id: string) => {
      try {
        const response = await instance.patch(`/toppings/${_id}/soft-delete`);
        return response.data;
      } catch (error) {
        throw new Error("Xóa mềm topping thất bại");
      }
    },
    onSuccess: () => {
      messageApi.success("Xóa mềm topping thành công");
      queryClient.invalidateQueries({ queryKey: ["toppings"] });
    },
    onError: (error) => {
      messageApi.error(`Lỗi: ${error.message}`);
    },
  });
  // Xóa cứng topping
  const mutationHardDeleteTopping = useMutation<void, Error, string>({
    mutationFn: async (_id: string) => {
      try {
        return await instance.delete(`/toppings/${_id}/hard-delete`);
      } catch (error) {
        throw new Error("Xóa cứng topping thất bại");
      }
    },
    onSuccess: () => {
      messageApi.success("Xóa mềm topping thành công");
      queryClient.invalidateQueries({
        queryKey: ["toppings"],
      });
    },

    onError: (error) => {
      messageApi.error(`Lỗi: ${error.message}`);
    },
  });

  const dataSource = toppings?.data.map((item: Topping, index: number) => ({
    _id: item._id,
    key: index + 1,
    nameTopping: item.nameTopping,
    statusTopping: item.statusTopping,
    priceTopping: item.priceTopping,
    isDeleted: item.isDeleted,
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
    {
      title: "Hành động",
      dataIndex: "action",
      render: (_: string, topping: Topping) => (
        <div className="flex flex-wrap gap-4">
          <Popconfirm
            title="Xóa mềm topping"
            description="Bạn có chắc muốn xóa mềm topping này không?"
            onConfirm={() => mutationSoftDeleteTopping.mutate(topping._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button className="bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-300">
              Xóa mềm
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Xóa cứng topping"
            description="Bạn có chắc muốn xóa cứng topping này không?"
            onConfirm={() => mutationHardDeleteTopping.mutate(topping._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button className="bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-300">
              Xóa cứng
            </Button>
          </Popconfirm>
        </div>
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
      {contextHolder}
      <div className="flex items-center justify-between mb-5">
        <Title level={3}>Danh sách Topping</Title>
        <Button type="primary" icon={<PlusCircleFilled />}>
          <Link to="/admin/topping/add" style={{ color: "white" }}>
            Thêm topping
          </Link>
        </Button>
      </div>
      <Table columns={columns} dataSource={dataSource} rowKey="_id" />
    </>
  );
};

export default ToppingManagerPage;
