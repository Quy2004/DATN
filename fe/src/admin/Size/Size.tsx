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
  
  export const Size = () => {
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
        queryKey: ["size", filterStatus, searchTerm, currentPage, pageSize],
        queryFn: async () => {
          try {
            const response = await instance.get(
              `/size?isDeleted=${
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
  
    // Soft delete size
    const mutationSoftDeleteSize = useMutation<void, Error, string>({
      mutationFn: async (_id: string) => {
        try {
          return await instance.patch(`/size/${_id}/soft-delete`);
        } catch (error) {
          throw new Error("Xóa mềm size thất bại");
        }
      },
      onSuccess: () => {
        messageApi.success("Xóa mềm size thành công");
        queryClient.invalidateQueries({ queryKey: ["size"] });
      },
      onError: (error) => {
        messageApi.error(`Lỗi: ${error.message}`);
      },
    });
  
    // Hard delete size
    const mutationHardDeleteSize = useMutation<void, Error, string>({
      mutationFn: async (_id: string) => {
        try {
          return await instance.delete(`/size/${_id}`);
        } catch (error) {
          throw new Error("Xóa cứng size thất bại");
        }
      },
      onSuccess: () => {
        messageApi.success("Xóa cứng size thành công");
        queryClient.invalidateQueries({ queryKey: ["size"] });
      },
      onError: (error) => {
        messageApi.error(`Lỗi: ${error.message}`);
      },
    });
  
    // Restore size
    const mutationRestoreSize = useMutation<void, Error, string>({
      mutationFn: async (_id: string) => {
        try {
          return await instance.patch(`/size/${_id}/restore`);
        } catch (error) {
          throw new Error("Khôi phục size thất bại");
        }
      },
      onSuccess: () => {
        messageApi.success("Khôi phục size thành công");
        queryClient.invalidateQueries({ queryKey: ["size"] });
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
  
    const columns = [
      {
        title: "STT",
        dataIndex: "key",
        key: "key",
      },
      {
        title: "Tên size",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Hành động",
        dataIndex: "action",
        render: (_: any, size: any) => (
          <div className="flex flex-wrap gap-4">
            {size.isDeleted ? (
              <Popconfirm
                title="Khôi phục size"
                description="Bạn có chắc muốn khôi phục size này không?"
                onConfirm={() => mutationRestoreSize.mutate(size._id)}
                okText="Yes"
                cancelText="No"
              >
                <Button className="bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300">
                  Khôi phục
                </Button>
              </Popconfirm>
            ) : (
              <Popconfirm
                title="Xóa mềm size"
                description="Bạn có chắc muốn xóa mềm size này không?"
                onConfirm={() => mutationSoftDeleteSize.mutate(size._id)}
                okText="Yes"
                cancelText="No"
              >
                <Button className="bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-300">
                  Xóa mềm
                </Button>
              </Popconfirm>
            )}
  
            <Popconfirm
              title="Xóa cứng size"
              description="Bạn có chắc muốn xóa cứng size này không?"
              onConfirm={() => mutationHardDeleteSize.mutate(size._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button className="bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-300">
                Xóa cứng
              </Button>
            </Popconfirm>
  
            <Button className="bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-300">
              <Link to={`/admin/size/${size._id}/update`}>Cập nhật</Link>
            </Button>
          </div>
        ),
      },
    ];
  
    const dataSource = data?.data?.map((item: any, index: number) => ({
        _id: item._id,
      key: index + 1,
      name: item.name,
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
          <Title level={3}>Danh sách size</Title>
  
          <div className="flex space-x-3">
            <Search
              placeholder="Tìm kiếm size"
              onSearch={handleSearch}
              allowClear
              style={{ width: 300 }}
            />
            <Select
              value={filterStatus}
              style={{ width: 200 }}
              onChange={handleFilterChange}
            >
              <Option value="all">Tất cả size</Option>
              <Option value="active">Size hoạt động</Option>
              <Option value="deleted">Size đã xóa mềm</Option>
            </Select>
            <Button type="primary" icon={<PlusCircleFilled />}>
              <Link to="/admin/size/add" style={{ color: "white" }}>
                Thêm size
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
  
  export default Size;
  