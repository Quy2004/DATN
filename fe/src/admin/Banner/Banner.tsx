import React from "react";
import { Button, Table, Space, message, Spin, Alert, Popconfirm } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "../../services/api";
import { Link } from "react-router-dom";
import { Banner } from "../../types/banner";
import Title from "antd/es/typography/Title";
import { PlusCircleFilled } from "@ant-design/icons";

const BannerManagerPage = () => {
  const queryClient = useQueryClient();
  const {
    data: banners,
    isLoading,
    isError,
  } = useQuery<Banner[]>({
    queryKey: ["banners"],
    queryFn: async () => {
      try {
        const response = await instance.get("banners");
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
      queryClient.invalidateQueries({ queryKey: ["banners"] }); // Làm mới dữ liệu
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

  const dataSource = banners?.map((item: Banner, index: number) => ({
    _id: item._id,
    key: index + 1,
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
    },
    {
      title: "Ảnh Banner",
      dataIndex: "imageBanner",
      key: "imageBanner",
      render: (text: string) => (
        <img src={text} alt="banner" style={{ width: "100px" }} />
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: string, banner: Banner) => (
        <Space size="middle">
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

          <Popconfirm
            title="Xóa vĩnh viễn"
            description="Bạn chắc chắn muốn xóa vĩnh viễn banner này không?"
            onConfirm={() => hardDeleteMutation.mutate(banner._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button className="bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-300">
              Xóa cứng
            </Button>
          </Popconfirm>
          <Button className="bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-300">
            <Link to={`/admin/banner/${banner._id}/update`}>Cập nhật</Link>
          </Button>
        </Space>
      ),
    },
  ];

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
        <Button
          type="primary"
          className="flex items-center justify-center bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-md transition duration-300 ease-in-out"
        >
          <Link to="/admin/banner/add" className="flex items-center space-x-2">
            <PlusCircleFilled />
            <span>Thêm banner</span>
          </Link>
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey={(record) => record._id}
      />
    </div>
  );
};

export default BannerManagerPage;
