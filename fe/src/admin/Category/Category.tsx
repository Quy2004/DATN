import {
  Table,
  Typography,
  Spin,
  Alert,
  Popconfirm,
  Button,
  message,
} from "antd";

import instance from "../../services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircleFilled } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title } = Typography;

export const Category = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const response = await instance.get(`/categories`);
        return response.data;
      } catch (error) {
        throw new Error("Lỗi khi tải dữ liệu từ API");
      }
    },
  });
  // Xóa mềm danh mục
  const mutationSoftDeleteCategory = useMutation<void, Error, string>({
    mutationFn: async (_id: string) => {
      try {
        return await instance.patch(`/categories/${_id}/soft-delete`);
      } catch (error) {
        throw new Error("Xóa mềm danh mục thất bại");
      }
    },
    onSuccess: () => {
      messageApi.success("Xóa mềm danh mục thành công");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      messageApi.error(`Lỗi: ${error.message}`);
    },
  });
  // Xóa cứng danh mục
  const mutationHardDeleteCategory = useMutation<void, Error, string>({
    mutationFn: async (_id: string) => {
      try {
        return await instance.delete(`/categories/${_id}`);
      } catch (error) {
        throw new Error("Xóa cứng danh mục thất bại");
      }
    },
    onSuccess: () => {
      messageApi.success("Xóa cứng danh mục thành công");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      messageApi.error(`Lỗi: ${error.message}`);
    },
  });

  // Khôi phục danh mục
  const mutationRestoreCategory = useMutation<void, Error, string>({
    mutationFn: async (_id: string) => {
      try {
        return await instance.patch(`/categories/${_id}/restore`);
      } catch (error) {
        throw new Error("Khôi phục danh mục thất bại");
      }
    },
    onSuccess: () => {
      messageApi.success("Khôi phục danh mục thành công");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      messageApi.error(`Lỗi: ${error.message}`);
    },
  });

  // Định nghĩa các cột cho bảng
  const columns = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
    },
    {
      title: "Tên danh mục",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Danh mục cha",
      dataIndex: "parentTitle",
      key: "parentTitle",
    },
    {
      title: "Hành động",
      dataIndex: "action",
      render: (_: any, category: any) => (
        <div className="flex space-x-3">
          {category.isDeleted ? (
            // Hiển thị nút khôi phục nếu danh mục đã bị xóa mềm
            <Popconfirm
              title="Khôi phục danh mục"
              description="Bạn có chắc muốn khôi phục danh mục này không?"
              onConfirm={() => mutationRestoreCategory.mutate(category._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="default">Khôi phục</Button>
            </Popconfirm>
          ) : (
            // Hiển thị nút xóa mềm nếu danh mục chưa bị xóa mềm
            <Popconfirm
              title="Xóa mềm danh mục"
              description="Bạn có chắc muốn xóa mềm danh mục này không?"
              onConfirm={() => mutationSoftDeleteCategory.mutate(category._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="default" danger>
                Xóa mềm
              </Button>
            </Popconfirm>
          )}

          <Popconfirm
            title="Xóa cứng danh mục"
            description="Bạn có chắc muốn xóa cứng danh mục này không?"
            onConfirm={() => mutationHardDeleteCategory.mutate(category._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger>
              Xóa cứng
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const dataSource = data?.data?.map((item: any, index: number) => ({
    key: index + 1,
    title: item.title,
    parentTitle: item.parent_id?.title || "Không có",
    _id: item._id,
    isDeleted: item.isDeleted,
  }));

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
        <Alert
          message="Lỗi"
          description={`Có lỗi xảy ra khi tải dữ liệu: ${error.message}`}
          type="error"
          showIcon
        />
      </div>
    );
  }
  return (
    <>
      {contextHolder}
      <div className="flex items-center justify-between mb-5">
        <Title level={3}>Danh sách danh mục</Title>
        <div className="flex space-x-3">
          <Button type="primary" icon={<PlusCircleFilled />}>
            <Link to="/admin/category/add" style={{ color: "white" }}>
              Thêm danh mục
            </Link>
          </Button>
        </div>
      </div>
      <Table dataSource={dataSource} columns={columns} />
    </>
  );
};

export default Category;
