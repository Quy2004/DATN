import React from "react";
import { Button, Table, Space, message, Popconfirm, Spin, Alert } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "../../services/api";
import { Link } from "react-router-dom";
import { Post } from "../../types/post";
import { DeleteOutlined, PlusCircleFilled } from "@ant-design/icons";
import Title from "antd/es/typography/Title";

const PostManagerPage = () => {
  const queryClient = useQueryClient();

  const {
    data: posts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        const response = await instance.get("posts");
        return response.data;
      } catch (error) {
        throw new Error("Lỗi khi tải danh sách bài viết");
      }
    },
  });

  // Mutation để xóa mềm banner
  const softDeleteMutation = useMutation<void, Error, string>({
    mutationFn: async (_id: string) => {
      return await instance.patch(`/posts/${_id}/soft-delete`);
    },
    onSuccess: () => {
      message.success("Xóa mềm banner thành công");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      message.error(`Lỗi: ${error.message}`);
    },
  });

  // Mutation để xóa cứng banner
  const hardDeleteMutation = useMutation<void, Error, string>({
    mutationFn: async (_id: string) => {
      return await instance.delete(`/posts/${_id}/hard-delete`);
    },
    onSuccess: () => {
      message.success("Xóa cứng banner thành công");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      message.error(`Lỗi: ${error.message}`);
    },
  });

  const restoreBanner = useMutation<void, Error, string>({
    mutationFn: async (_id: string) => {
      try {
        return await instance.patch(`/posts/${_id}/restore`);
      } catch (error) {
        throw new Error("Khôi phục banner thất bại");
      }
    },
    onSuccess: () => {
      message.success("Khôi phục banner thành công");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      message.error(`Lỗi: ${error.message}`);
    },
  });

  const dataSource = posts?.data?.map((post: Post, index: number) => ({
    _id: post._id,
    key: index + 1,
    title: post.title,
    categoryPost: post.categoryPost.title,
    excerpt: post.excerpt,
    imagePost: post.imagePost,
    isDeleted: post.isDeleted,
  }));

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Excerpt",
      dataIndex: "excerpt",
      key: "excerpt",
    },
    {
      title: "Danh mục",
      dataIndex: "categoryPost",
      key: "categoryPost",
    },
    {
      title: "Ảnh",
      dataIndex: "imagePost",
      key: "imagePost",
      render: (text: string) => (
        <img src={text} alt="post" style={{ width: "100px" }} />
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: string, post: Post) => (
        <Space size="middle">
          <Popconfirm
            title="Xóa"
            description="Bạn có chắc chắn muốn xóa bài viết này không?"
            onConfirm={() => softDeleteMutation.mutate(post._id)}
            okText="Có"
            cancelText="Không"
            disabled={post.isDeleted}
          >
            <Button className="bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-300">
              Xóa
            </Button>
          </Popconfirm>

          <Popconfirm
            title="Xóa vĩnh viễn"
            description="Bạn có chắc chắn muốn xóa vĩnh viễn bài viết này không?"
            onConfirm={() => hardDeleteMutation.mutate(post._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button className="bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-300">
              <DeleteOutlined /> Xóa vĩnh viễn
            </Button>
          </Popconfirm>
          <Link to={`/admin/post/${post._id}/update`}>
            <Button className="bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-300">
              Cập nhật
            </Button>
          </Link>
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
        <Title level={3}>Danh sách bài viết</Title>

        <Link to="/admin/post/add" className="flex items-center space-x-2">
          <Button
            type="primary"
            className="flex items-center justify-center bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-md transition duration-300 ease-in-out"
          >
            <PlusCircleFilled />
            <span>Thêm bài viết</span>
          </Button>
        </Link>
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey={(record) => record._id}
        loading={isLoading}
      />
      {isError && <p>Lỗi khi tải dữ liệu bài viết</p>}
    </div>
  );
};

export default PostManagerPage;
