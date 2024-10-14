import {
  Table,
  Typography,
  Spin,
  Alert,
  Popconfirm,
  Button,
  message,
  Select,
} from "antd";

import instance from "../../services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircleFilled } from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Search from "antd/es/input/Search";

const { Title } = Typography;

const { Option } = Select;

export const Category = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // State cho phân trang
  const [pageSize, setPageSize] = useState(10); // Số lượng mục trên mỗi trang

  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  // Hàm cập nhật URL khi có thay đổi bộ lọc và phân trang
  const updateUrlParams = () => {
    const searchParams = new URLSearchParams();
    if (searchTerm) searchParams.set("search", searchTerm);
    searchParams.set("filterStatus", filterStatus);
    searchParams.set("page", currentPage.toString());
    searchParams.set("limit", pageSize.toString());
    navigate({ search: searchParams.toString() });
  };

  useEffect(() => {
    updateUrlParams();
  }, [filterStatus, searchTerm, currentPage, pageSize]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["categories", filterStatus, searchTerm, currentPage, pageSize],
    queryFn: async () => {
      try {
        const response = await instance.get(
          `/categories?isDeleted=${
            filterStatus === "deleted" ? true : false
          }&all=${
            filterStatus === "all" ? true : false
          }&search=${searchTerm}&page=${currentPage}&limit=${pageSize}`
        );
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
  // Xử lý thay đổi trạng thái bộ lọc
  const handleFilterChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };
  // Xử lý thay đổi phân trang
  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current); // Cập nhật trang hiện tại
    setPageSize(pagination.pageSize); // Cập nhật số lượng mỗi trang
  };

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
        <div className="flex flex-wrap gap-4">
          {category.isDeleted ? (
            // Hiển thị nút khôi phục nếu danh mục đã bị xóa mềm
            <Popconfirm
              title="Khôi phục danh mục"
              description="Bạn có chắc muốn khôi phục danh mục này không?"
              onConfirm={() => mutationRestoreCategory.mutate(category._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button className="bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300">
                Khôi phục
              </Button>
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
              <Button className="bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-300">
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
            <Button className="bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-300">
              Xóa cứng
            </Button>
          </Popconfirm>

          <Button className="bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-300">
            <Link to={`/admin/category/${category._id}/update`}>Cập nhật</Link>
          </Button>
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
          <Search
            placeholder="Tìm kiếm danh mục"
            onSearch={handleSearch}
            allowClear
            style={{ width: 300 }}
          />
          <Select
            value={filterStatus}
            style={{ width: 200 }}
            onChange={handleFilterChange}
          >
            <Option value="all">Tất cả danh mục</Option>
            <Option value="active">Danh mục hoạt động</Option>
            <Option value="deleted">Danh mục đã xóa mềm</Option>
          </Select>
          <Button type="primary" icon={<PlusCircleFilled />}>
            <Link to="/admin/category/add" style={{ color: "white" }}>
              Thêm danh mục
            </Link>
          </Button>
        </div>
      </div>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: data?.pagination?.totalItems || 0,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        onChange={handleTableChange}
      />
    </>
  );
};

export default Category;
