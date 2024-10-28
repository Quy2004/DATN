import {
  Table,
  Typography,
  Spin,
  Alert,
  Popconfirm,
  Button,
  message,
  Select,
  TablePaginationConfig,
  Tooltip,
} from "antd";

import instance from "../../services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DeleteOutlined,
  PlusCircleFilled,
  UndoOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import Search from "antd/es/input/Search";
import { Category } from "../../types/category";

const { Title } = Typography;

const { Option } = Select;

export const CategoryManagerPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDelete, setIsDelete] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const navigate = useNavigate();
  const location = useLocation();

  // Hàm cập nhật URL khi có thay đổi bộ lọc và phân trang
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams(location.search);
    if (searchTerm) params.set("search", searchTerm);
    if (isDelete) {
      params.set("isDelete", "true");
    }
    params.set("filterStatus", filterStatus);
    params.set("page", currentPage.toString());
    params.set("limit", pageSize.toString());
    navigate({ search: params.toString() }, { replace: true });
  }, [
    filterStatus,
    searchTerm,
    currentPage,
    pageSize,
    location.search,
    isDelete,
    navigate,
  ]);

  useEffect(() => {
    updateUrlParams();
  }, [
    filterStatus,
    searchTerm,
    currentPage,
    pageSize,
    isDelete,
    updateUrlParams,
  ]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "categories",
      filterStatus,
      searchTerm,
      currentPage,
      pageSize,
      isDelete,
    ],
    queryFn: async () => {
      try {
        const trashParam = isDelete ? `&isDeleted=true` : "";
        const response = await instance.get(
          `/categories?&${trashParam}&all=${
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
  const handleTableChange = (pagination: TablePaginationConfig) => {
    setCurrentPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 10);
  };
  const handleIsDeleteToggle = () => {
    setIsDelete((prev) => !prev);
    setCurrentPage(1);
    updateUrlParams();
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
      render: (text: string, category: Category) => (
        <div>
          {category.isDeleted ? (
            <>
              <DeleteOutlined style={{ color: "red", marginRight: 8 }} />
              <span style={{ textDecoration: "line-through", color: "gray" }}>
                {text}
              </span>
            </>
          ) : (
            text
          )}
        </div>
      ),
    },
    {
      title: "Danh mục cha",
      dataIndex: "parentTitle",
      key: "parentTitle",
    },
    {
      title: "Hành động",
      dataIndex: "action",
      render: (_: string, category: Category) => (
        <div className="flex flex-wrap gap-4">
          {category.isDeleted ? (
            // Nếu danh mục bị xóa mềm, hiển thị nút khôi phục và xóa cứng
            <>
              <Popconfirm
                title="Khôi phục danh mục"
                description="Bạn có chắc muốn khôi phục danh mục này không?"
                onConfirm={() => mutationRestoreCategory.mutate(category._id)}
                okText="Yes"
                cancelText="No"
              >
                <Button className="bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300">
                  <UndoOutlined className="h-4 w-4" /> Khôi phục
                </Button>
              </Popconfirm>

              <Popconfirm
                title="Xóa vĩnh viễn"
                description="Bạn có chắc muốn xóa danh mục này vĩnh viễn?"
                onConfirm={() =>
                  mutationHardDeleteCategory.mutate(category._id)
                }
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
                title="Xóa danh mục"
                description="Bạn có chắc muốn xóa danh mục này không?"
                onConfirm={() =>
                  mutationSoftDeleteCategory.mutate(category._id)
                }
                okText="Yes"
                cancelText="No"
              >
                <Button className="bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-300">
                  Xóa
                </Button>
              </Popconfirm>

              <Link to={`/admin/category/${category._id}/update`}>
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

  const dataSource = data?.data?.map((item: Category, index: number) => ({
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
          </Select>

          <Tooltip title="Sản phẩm đã xóa mềm">
            <Button
              type="primary"
              icon={<DeleteOutlined />}
              className={`transform transition-transform duration-300 ${
                isDelete ? "scale-110" : ""
              }`}
              onClick={handleIsDeleteToggle}
            ></Button>
          </Tooltip>
        </div>
        <Link to="/admin/category/add" className="flex items-center space-x-2">
          <Button
            type="primary"
            className="flex items-center justify-center bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-md transition duration-300 ease-in-out"
          >
            <PlusCircleFilled />
            <span>Thêm danh mục</span>
          </Button>
        </Link>
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

export default CategoryManagerPage;
