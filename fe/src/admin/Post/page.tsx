import React, { useState } from "react";
import {
  Button,
  Table,
  Space,
  message,
  Popconfirm,
  Spin,
  Alert,
  Modal,
  Descriptions,
  Input,
  Select,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "../../services/api";
import { Link } from "react-router-dom";
import { Post } from "../../types/post";
import {
  DeleteOutlined,
  PlusCircleFilled,
  SearchOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import Title from "antd/es/typography/Title";
import { CategoryPost } from "../../types/categoryPost";

const PostManagerPage = () => {
  const queryClient = useQueryClient();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [searchText, setSearchText] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const {
    data: posts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["posts", showDeleted],
    queryFn: async () => {
      try {
        const response = await instance.get("posts", {
          params: {
            isDeleted: showDeleted,
          },
        });
        return response.data;
      } catch (error) {
        throw new Error("Lỗi khi tải danh sách bài viết");
      }
    },
  });
  console.log(selectedPost);

  // Lấy danh sách danh mục
  const {
    data: categoryPost,
    isLoading: loadingCategories,
    isError: errorCategories,
  } = useQuery({
    queryKey: ["categoryPost"],
    queryFn: async () => {
      const response = await instance.get("categoryPost");
      return response.data;
    },
  });
  // Mutation để xóa mềm bài viết
  const softDeleteMutation = useMutation<void, Error, string>({
    mutationFn: async (_id: string) => {
      return await instance.patch(`/posts/${_id}/soft-delete`);
    },
    onSuccess: () => {
      message.success("Xóa mềm bài viết thành công");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      message.error(`Lỗi: ${error.message}`);
    },
  });

  // Mutation để xóa cứng bài viết
  const hardDeleteMutation = useMutation<void, Error, string>({
    mutationFn: async (_id: string) => {
      return await instance.delete(`/posts/${_id}/hard-delete`);
    },
    onSuccess: () => {
      message.success("Xóa cứng bài viết thành công");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      message.error(`Lỗi: ${error.message}`);
    },
  });

  const restorePost = useMutation<void, Error, string>({
    mutationFn: async (_id: string) => {
      try {
        return await instance.patch(`/posts/${_id}/restore`);
      } catch (error) {
        throw new Error("Khôi phục bài viết thất bại");
      }
    },
    onSuccess: () => {
      message.success("Khôi phục bài viết thành công");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      message.error(`Lỗi: ${error.message}`);
    },
  });
  const showModal = (post: Post) => {
    setIsModalVisible(true);
    setSelectedPost({
      ...post,
      categoryPost: post.categoryPost || { title: "Không xác định" },
    });
  };
  const handleToggleDeleted = () => {
    setShowDeleted((prev) => !prev);
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  };
  const dataSource = posts?.data
    ?.filter(
      (item: Post) =>
        showDeleted === Boolean(item.isDeleted) &&
        item.title.toLowerCase().includes(searchText.toLowerCase()) &&
        (selectedCategory ? item.categoryPost._id === selectedCategory : true)
    )
    .map((post: Post, index: number) => ({
      _id: post._id,
      key: index + 1,
      title: post.title,
      categoryPost: post.categoryPost.title,
      excerpt: post.excerpt,
      content: post.content,
      imagePost: post.imagePost,
      galleryPost: post.galleryPost,
      isDeleted: post.isDeleted,
      createdAt: new Date(post.createdAt),
    }));

  const columns = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 100,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: Post) => (
        <p
          onClick={() => showModal(record)}
          className="truncate max-w-80 text-gray-950 cursor-pointer hover:text-blue-700"
        >
          {text}
        </p>
      ),
      filterDropdown: () => (
        <Input
          className="Input-antd text-sm placeholder-gray-400 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Tìm kiếm"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200 }}
        />
      ),
      filterIcon: <SearchOutlined className="text-blue-500" />,
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
      title: "Danh mục",
      dataIndex: "categoryPost",
      key: "categoryPost",
    },

    {
      title: "Hành động",
      key: "action",
      render: (_: string, post: Post) => (
        <Space size="middle">
          {post.isDeleted ? (
            <Space>
              <Popconfirm
                title="Khôi phục"
                description="Bạn chắc chắn muốn khôi phục bài viết này không?"
                onConfirm={() => restorePost.mutate(post._id)}
                okText="Có"
                cancelText="Không"
              >
                <Button className="bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300">
                  <UndoOutlined className="h-4 w-4" />
                  Khôi phục
                </Button>
              </Popconfirm>{" "}
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
            </Space>
          ) : (
            <Space>
              {" "}
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
              <Link to={`/admin/post/${post._id}/update`}>
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
  if (isLoading || loadingCategories) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (isError || errorCategories) {
    return (
      <div style={{ margin: "20px 0" }}>
        <Alert message="Lỗi khi tải dữ liệu" type="error" showIcon />
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <Title level={3}>Danh sách bài viết</Title>

        <Space>
          <Select
            placeholder="Chọn danh mục"
            style={{ width: 200 }}
            onChange={setSelectedCategory}
            allowClear
          >
            {categoryPost?.data?.map((category: CategoryPost) => (
              <Select.Option key={category._id} value={category._id}>
                {category.title}
              </Select.Option>
            ))}
          </Select>
          <Button
            onClick={handleToggleDeleted}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-white font-semibold transition-colors duration-300 ${
              showDeleted
                ? "bg-red-500 hover:bg-red-600 active:bg-red-700"
                : " bg-blue-500 hover:bg-blue-600 active:bg-blue-700"
            } text-white`}
          >
            <DeleteOutlined className="h-4 w-4" />
            {showDeleted ? "Quay lại" : "Thùng rác"}
          </Button>

          <Link to="/admin/post/add" className="flex items-center space-x-2">
            <Button
              type="primary"
              className="flex items-center justify-center bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-md transition duration-300 ease-in-out"
            >
              <PlusCircleFilled />
              <span>Thêm bài viết</span>
            </Button>
          </Link>
        </Space>
      </div>
      <Modal
        className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50"
        title={
          <h2 className="text-xl font-bold text-gray-800">Chi tiết bài viết</h2>
        }
        width={800}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <div className="flex justify-end">
            <Button
              key="close"
              onClick={() => setIsModalVisible(false)}
              className="bg-blue-600 text-white hover:bg-blue-500 transition duration-200"
            >
              Đóng
            </Button>
          </div>,
        ]}
        destroyOnClose
      >
        <div className="p-5 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"></div>
        {selectedPost && (
          <div className=" max-h-[70vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4"></h3>
            <Descriptions layout="horizontal" colon bordered column={2}>
              <Descriptions.Item label="Tiêu đề">
                {selectedPost.title}
              </Descriptions.Item>
              <Descriptions.Item label="Danh mục" className="font-medium">
                {selectedPost.categoryPost?.title ?? selectedPost.categoryPost}
              </Descriptions.Item>
              <Descriptions.Item label="Ảnh">
                <div className="mb-6">
                  <img
                    src={selectedPost.imagePost}
                    alt={selectedPost.title}
                    className="w-[100px] h-100 object-cover rounded-lg shadow-md"
                  />
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Ảnh phụ">
                <div className="mb-6">
                  {selectedPost.galleryPost.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`${selectedPost.title} - ảnh phụ ${index + 1}`}
                      className="w-[80px] h-100 object-cover rounded-lg shadow-md m-1"
                    />
                  ))}
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Tóm tắt">
                <div
                  className="text-gray-700"
                  dangerouslySetInnerHTML={{ __html: selectedPost.excerpt }}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Nội dung">
                <div
                  className="text-gray-700"
                  dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                />
              </Descriptions.Item>

              <Descriptions.Item label="Ngày tạo">
                {new Date(selectedPost.createdAt).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey={(record) => record._id}
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} bài viết`,
        }}
        className="bg-white rounded-lg shadow-sm"
        scroll={{ x: "max-content", y: 350 }}
      />
      {isError && <p>Lỗi khi tải dữ liệu bài viết</p>}
    </div>
  );
};

export default PostManagerPage;
