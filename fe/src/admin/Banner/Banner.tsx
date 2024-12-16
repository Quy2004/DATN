import React, { useState } from "react";
import {
  Button,
  Table,
  Space,
  message,
  Spin,
  Alert,
  Popconfirm,
  Image,
  Input,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "../../services/api";
import { Link } from "react-router-dom";
import { Banner } from "../../types/banner";
import Title from "antd/es/typography/Title";
import {
  DeleteOutlined,
  PlusCircleFilled,
  SearchOutlined,
  UndoOutlined,
} from "@ant-design/icons";

const BannerManagerPage = () => {
  const queryClient = useQueryClient();
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const {
    data: banners,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["banners", showDeleted, currentPage, pageSize],
    queryFn: async () => {
      try {
        const response = await instance.get("banners", {
          params: {
            page: currentPage,
            limit: pageSize,
            isDeleted: showDeleted,
          },
        });
        return response.data;
      } catch (error) {
        throw new Error("Lỗi khi tải danh sách banner");
      }
    },
  });

  // Mutation để xóa mềm banner
  const softDeleteMutation = useMutation<void, Error, string>({
    mutationFn: async (_id: string) => {
      return await instance.patch(`/banners/${_id}/soft-delete`);
    },
    onSuccess: () => {
      message.success("Xóa mềm banner thành công");
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
    onError: (error) => {
      message.error(`Lỗi: ${error.message}`);
    },
  });

  // Mutation để xóa cứng banner
  const hardDeleteMutation = useMutation<void, Error, string>({
    mutationFn: async (_id: string) => {
      return await instance.delete(`/banners/${_id}/hard-delete`);
    },
    onSuccess: () => {
      message.success("Xóa cứng banner thành công");
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
    onError: (error) => {
      message.error(`Lỗi: ${error.message}`);
    },
  });
  // Mutation để khôi phục banner
  const restoreBanner = useMutation<void, Error, string>({
    mutationFn: async (_id: string) => {
      try {
        return await instance.patch(`/banners/${_id}/restore`);
      } catch (error) {
        throw new Error("Khôi phục banner thất bại");
      }
    },
    onSuccess: () => {
      message.success("Khôi phục banner thành công");
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
    onError: (error) => {
      message.error(`Lỗi: ${error.message}`);
    },
  });
  const dataSource = banners?.data
    .filter(
      (item: Banner) =>
        showDeleted === Boolean(item.isDeleted) &&
        item.title.toLowerCase().includes(searchText.toLowerCase())
    )
    .map((item: Banner, index: number) => ({
      _id: item._id,
      key: (currentPage - 1) * pageSize + index + 1,
      title: item.title,
      imageBanner: item.imageBanner,
      isDeleted: item.isDeleted,
    }));

  const columns = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      filterDropdown: () => (
        <Input
          className="Input-antd text-sm placeholder-gray-400 "
          placeholder="Tìm kiếm"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      ),
      filterIcon: <SearchOutlined />,
    },
    {
      title: "Ảnh Banner",
      dataIndex: "imageBanner",
      key: "imageBanner",
      render: (image: string) => (
        <Image
          src={image}
          alt={image}
          width={100}
          height={100}
          className="object-cover"
        />
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: string, banner: Banner) => (
        <Space size="middle">
          {banner.isDeleted ? (
            <Space>
              <Popconfirm
                title="Khôi phục"
                description="Bạn chắc chắn muốn khôi phục banner này không?"
                onConfirm={() => restoreBanner.mutate(banner._id)}
                okText="Có"
                cancelText="Không"
              >
                <Button className="bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300">
                  <UndoOutlined className="h-4 w-4" />
                  Khôi phục
                </Button>
              </Popconfirm>

              <Popconfirm
                title="Xóa vĩnh viễn"
                description="Bạn chắc chắn muốn xóa vĩnh viễn banner này không?"
                onConfirm={() => hardDeleteMutation.mutate(banner._id)}
                okText="Có"
                cancelText="Không"
              >
                <Button className="bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-300">
                  <DeleteOutlined /> Xóa vĩnh viễn
                </Button>
              </Popconfirm>
            </Space>
          ) : (
            <Space>
              <Popconfirm
                title="Xóa"
                description="Bạn có chắc chắn muốn xóa banner này không?"
                onConfirm={() => softDeleteMutation.mutate(banner._id)}
                okText="Có"
                cancelText="Không"
                disabled={banner.isDeleted}
              >
                <Button className="bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-300">
                  Xóa
                </Button>
              </Popconfirm>
              <Link to={`/admin/banner/${banner._id}/update`}>
                <Button className="bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-300">
                  Cập nhật
                </Button>
              </Link>
            </Space>
          )}
        </Space>
      ),
    },
  ];
  const handleToggleDeleted = () => {
    setShowDeleted((prev) => !prev);
    setCurrentPage(1);
    queryClient.invalidateQueries({ queryKey: ["banners"] });
  };
  const handlePageChange = (page: number, newPageSize: number) => {
    setCurrentPage(page);
    if (pageSize !== newPageSize) {
      setPageSize(newPageSize);
    }
  };
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ margin: "20px 0" }}>
        <Alert message="Lỗi khi tải danh sách banner" type="error" showIcon />
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <Title level={3}>Danh sách banner</Title>
        <Space>
          <Button
            onClick={handleToggleDeleted}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-white font-semibold transition-colors duration-300 ${
              showDeleted
                ? "bg-red-500 hover:bg-red-600 active:bg-red-700"
                : " bg-blue-500 hover:bg-blue-600 active:bg-blue-700"
            }`}
          >
            <DeleteOutlined className="h-4 w-4" />
            {showDeleted ? "Quay lại" : "Thùng rác"}
          </Button>

          <Link to="/admin/banner/add" className="flex items-center space-x-2">
            <Button
              type="primary"
              className="flex items-center justify-center bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-md transition duration-300 ease-in-out"
            >
              <PlusCircleFilled />
              <span>Thêm banner</span>
            </Button>
          </Link>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey={(record) => record._id}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: banners?.total,
          onChange: handlePageChange,
        }}
        scroll={{ x: "max-content", y: 350 }}
      />
    </div>
  );
};

export default BannerManagerPage;
