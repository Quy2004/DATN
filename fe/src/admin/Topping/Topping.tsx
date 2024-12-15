import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import instance from "../../services/api";
import {
  Alert,
  Button,
  Input,
  message,
  Popconfirm,
  Spin,
  Switch,
  Table,
  Tooltip,
} from "antd";

import Title from "antd/es/typography/Title";
import { Topping } from "../../types/topping";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  PlusCircleFilled,
  SearchOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { ColumnsType } from "antd/es/table";
import { Category } from "../../types/category";

const ToppingManagerPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [filteredStatus] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedCategory] = useState<string | null>(null);

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
  const { data: categories, isLoading: isLoadingCategory } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await instance.get(`categories`);
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
      messageApi.success("Xóa cứng topping thành công");
      queryClient.invalidateQueries({
        queryKey: ["toppings"],
      });
    },

    onError: (error) => {
      messageApi.error(`Lỗi: ${error.message}`);
    },
  });
  const mutationRestoreTopping = useMutation<void, Error, string>({
    mutationFn: async (_id: string) => {
      try {
        return await instance.patch(`/toppings/${_id}/restore`);
      } catch (error) {
        throw new Error("Khôi phục topping thất bại");
      }
    },
    onSuccess: () => {
      messageApi.success("Khôi phục topping thành công");
      queryClient.invalidateQueries({ queryKey: ["toppings"] });
    },
    onError: (error) => {
      messageApi.error(`Lỗi: ${error.message}`);
    },
  });

  const handleStatusChange = async (checked: boolean, id: string) => {
    try {
      const newStatus = checked ? "available" : "unavailable";
      await instance.patch(`/toppings/${id}/update-status`, {
        statusTopping: newStatus,
      }); // Gọi API cập nhật trạng thái
      message.success("Cập nhật trạng thái Topping thành công!");
      queryClient.invalidateQueries({
        queryKey: ["toppings"],
      });
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái!");
    }
  };

  const dataSource = toppings?.data
    .filter((item: Topping) => {
      // Lọc theo trạng thái xóa mềm
      if (showDeleted) return item.isDeleted;
      // Lọc theo trạng thái và tên topping
      return (
        !item.isDeleted &&
        (!filteredStatus || item.statusTopping === filteredStatus) &&
        item.nameTopping.toLowerCase().includes(searchText.toLowerCase()) &&
        (!selectedCategory || item.category_id.title === selectedCategory) // Lọc theo danh mục
      );
    })
    .map((item: Topping, index: number) => ({
      _id: item._id,
      key: index + 1,
      nameTopping: item.nameTopping,
      statusTopping: item.statusTopping,
      priceTopping: item.priceTopping,
      isDeleted: item.isDeleted,
      categoryTitle: Array.isArray(item.category_id)
        ? item.category_id
            .map((category: Category) => category.title)
            .join(", ")
        : item.category_id?.title || "",
    }));
  const subcategories = categories?.data?.filter(
    (category: Category) => category.parent_id !== null
  );
  const columns: ColumnsType<Topping> = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      render: (text: string, record: Topping, index: number) => index + 1,
      width: 80,
    },
    {
      title: "Tên Topping",
      dataIndex: "nameTopping",
      key: "nameTopping",
      filterDropdown: () => (
        <Input
          placeholder="Tìm kiếm Topping"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      ),
      filterIcon: <SearchOutlined />,
    },

    {
      title: "Giá Topping",
      dataIndex: "priceTopping",
      key: "priceTopping",
      render: (price: number) => `${price.toLocaleString("vi-VN")} VND`,
      filters: [
        { text: "Dưới 5,000 VND", value: "low" },
        { text: "Từ 5,000 VND - 10,000 VND", value: "medium" },
        { text: "Trên 10,000 VND", value: "high" },
      ],
      onFilter: (value, record) => {
        if (value === "low") return record.priceTopping < 5000;
        if (value === "medium")
          return record.priceTopping >= 5000 && record.priceTopping <= 10000;
        if (value === "high") return record.priceTopping > 10000;
        return true;
      },
    },
    {
      title: "Danh Mục",
      dataIndex: "categoryTitle",
      key: "categoryTitle",
      filters:
        subcategories?.map((subcategories: Category) => ({
          text: subcategories.title,
          value: subcategories.title,
        })) || [],
      onFilter: (value, record) => record.categoryTitle === value,
      render: (categoryTitle) => <span>{categoryTitle}</span>,
    },

    {
      title: "Trạng Thái",
      dataIndex: "statusTopping",
      key: "statusTopping",
      filters: [
        { text: "Có sẵn", value: "available" },
        { text: "Hết hàng", value: "unavailable" },
      ],

      onFilter: (value, record) => record.statusTopping === value,

      render: (status, record) => (
        <div className="flex items-center space-x-2">
          <Tooltip
            title={
              status === "available"
                ? "Topping hiện có sẵn"
                : "Topping hiện đã hết hàng"
            }
          >
            <Switch
              checked={status === "available"}
              onChange={(checked) => handleStatusChange(checked, record._id)}
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              style={{
                backgroundColor: status === "available" ? "#52c41a" : "#f5222d",
              }}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Hành động",
      dataIndex: "action",
      render: (_: string, topping: Topping) => (
        <div className="flex flex-wrap gap-4">
          {showDeleted ? (
            <>
              <Popconfirm
                title="Khôi phục topping"
                description="Bạn có chắc muốn khôi phục topping này không?"
                onConfirm={() => mutationRestoreTopping.mutate(topping._id)}
                okText="Yes"
                cancelText="No"
              >
                <Button className="bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-300">
                  <UndoOutlined className="h-4 w-4" /> Khôi phục
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Xóa vĩnh viễn"
                description="Bạn có chắc muốn xóa topping này vĩnh viễn?"
                onConfirm={() => mutationHardDeleteTopping.mutate(topping._id)}
                okText="Yes"
                cancelText="No"
              >
                <Button className="bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-300">
                  <DeleteOutlined /> Xóa vĩnh viễn
                </Button>
              </Popconfirm>
            </>
          ) : (
            <>
              <Popconfirm
                title="Xóa topping"
                description="Bạn có chắc muốn xóa topping này không?"
                onConfirm={() => mutationSoftDeleteTopping.mutate(topping._id)}
                okText="Yes"
                cancelText="No"
              >
                <Button className="bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-300">
                  Xóa
                </Button>
              </Popconfirm>

              <Link to={`/admin/topping/${topping._id}/update`}>
                <Button className="bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-300">
                  Cập nhật
                </Button>
              </Link>
            </>
          )}
        </div>
      ),
    },
  ];

  if (isLoading || isLoadingCategory) {
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
      <div className="flex items-center justify-between mb-5 space-x-4">
        <Title level={3} className="text-2xl font-semibold text-gray-700">
          Danh sách Topping
        </Title>
        <div className="flex items-center space-x-3">
          {" "}
          <Button
            type="default"
            icon={<DeleteOutlined className="" />}
            onClick={() => setShowDeleted(!showDeleted)}
            className={`flex items-center justify-center px-4 py-2 rounded-md text-white transition-all duration-300 ${
              showDeleted
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {showDeleted ? "" : ""}
          </Button>
          <Button
            type="primary"
            className="flex items-center justify-center bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-md transition duration-300 ease-in-out"
          >
            <Link
              to="/admin/topping/add"
              className="flex items-center space-x-2"
            >
              <PlusCircleFilled />
              <span>Thêm topping</span>
            </Link>
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="_id"
        className="transition-all duration-500 ease-in-out"
        pagination={{
          total: dataSource?.pagination?.totalItems || 0,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        scroll={{ x: "max-content", y: 310 }}
      />
    </>
  );
};

export default ToppingManagerPage;
