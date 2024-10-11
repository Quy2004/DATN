import { Table, Typography, Spin, Alert } from "antd";

import instance from "../../services/api";
import { useQuery } from "@tanstack/react-query";

const { Title } = Typography;

export const Category = () => {
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
      <div className="flex items-center justify-between mb-5">
        <Title level={3}>Danh sách danh mục</Title>
        <div className="flex space-x-3"></div>
      </div>
      <Table dataSource={dataSource} columns={columns} />
    </>
  );
};

export default Category;
