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

const Voucher = () => {
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
		queryKey: ["vouchers", filterStatus, searchTerm, currentPage, pageSize],
		queryFn: async () => {
			try {
				const response = await instance.get(
					`/vouchers?isDeleted=${
						filterStatus === "deleted" ? true : false
					}&all=${
						filterStatus === "all" ? true : false
					}&search=${searchTerm}&page=${currentPage}&limit=${pageSize}`,
				);
				return response.data;
			} catch (error) {
				throw new Error("Lỗi khi tải dữ liệu từ API");
			}
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

	// Đinh nghĩa table
	const columns = [
		{
			title: "STT",
			dataIndex: "key",
			key: "key",
		},
		{
			title: "Tên",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "Mã voucher",
			dataIndex: "code",
			key: "code",
		},
		{
			title: "Phần trăm giảm giá",
			dataIndex: "discountPercentage",
			key: "discountPercentage",
		},
		{
			title: "Giảm giá tối đa",
			dataIndex: "maxDiscount",
			key: "maxDiscount",
		},
		{
			title: "Số lượng",
			dataIndex: "quantity",
			key: "quantity",
		},
		{
			title: "Ngày bắt đầu",
			dataIndex: "minOrderDate",
			key: "minOrderDate",
		},
		{
			title: "Ngày kết thúc",
			dataIndex: "maxOrderDate",
			key: "maxOrderDate",
		},
		{
			title: "Hành động",
			dataIndex: "action",
			render: (_: any, category: any) => (
				<div className="flex flex-wrap gap-4">
                    
					<Button className="bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-300">
						<Link to={`/admin/category/${category._id}/update`}>Cập nhật</Link>
					</Button>
				</div>
			),
		},
	];

    const dataSource = data?.data?.map((item: any, index: number) => ({
        key: index + 1,
        name: item.name,
        code: item.code,
        discountPercentage: item.discountPercentage,
        maxDiscount: item.maxDiscount,
        quantity: item.quantity,
        minOrderDate: item.minOrderDate,
        maxOrderDate: item.maxOrderDate,
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
            <Title level={3}>Danh sách voucher</Title>
    
            <div className="flex space-x-3">
              <Search
                placeholder="Tìm kiếm voucher"
                onSearch={handleSearch}
                allowClear
                style={{ width: 300 }}
              />
              <Select
                value={filterStatus}
                style={{ width: 200 }}
                onChange={handleFilterChange}
              >
                <Option value="all">Tất cả voucher</Option>
                <Option value="active">voucher hoạt động</Option>
                <Option value="deleted">voucher đã xóa mềm</Option>
              </Select>
              <Button type="primary" icon={<PlusCircleFilled />}>
                <Link to="/admin/voucher/add" style={{ color: "white" }}>
                  Thêm voucher
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

export default Voucher;
