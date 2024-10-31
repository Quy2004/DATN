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
import moment from "moment";

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

	// xóa mềm voucher
	const mutationSoftDeleteVoucher = useMutation<void, Error, string>({
		mutationFn: async (_id: string) => {
			try {
				return await instance.patch(`/vouchers/${_id}/soft-delete`);
			} catch (error) {
				throw new Error("Xóa mềm voucher thất bại");
			}
		},
		onSuccess: () => {
			messageApi.success("Xóa mềm voucher thành công");
			queryClient.invalidateQueries({ queryKey: ["vouchers"] });
		},
		onError: error => {
			messageApi.error(`Lỗi: ${error.message}`);
		},
	});

	// xóa cứng voucher
	const mutationHardDeleteVoucher = useMutation<void, Error, string>({
		mutationFn: async (_id: string) => {
			try {
				return await instance.delete(`/vouchers/${_id}`);
			} catch (error) {
				throw new Error("Xóa cứng voucher thất bại");
			}
		},
		onSuccess: () => {
			messageApi.success("Xóa cứng voucher thành công");
			queryClient.invalidateQueries({ queryKey: ["vouchers"] });
		},
		onError: error => {
			messageApi.error(`Lỗi: ${error.message}`);
		},
	});

	// khôi phục voucher
	const mutationRestoreVoucher = useMutation<void, Error, string>({
		mutationFn: async (_id: string) => {
			try {
				return await instance.patch(`/vouchers/${_id}/restore`);
			} catch (error) {
				throw new Error((error as any).response.data.message);
			}
			
		},
		onSuccess: () => {
			messageApi.success("Khôi phục voucher thành công");
			queryClient.invalidateQueries({ queryKey: ["vouchers"] });
		},
		onError: error => {
			messageApi.error(`Thất bại: ${error.message}`);
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
			render: (text : any) => moment(text).format('DD/MM/YYYY HH:mm'),
		},
		{
			title: "Ngày kết thúc",
			dataIndex: "maxOrderDate",
			key: "maxOrderDate",
			render: (text : any) => moment(text).format('DD/MM/YYYY HH:mm'),
		},
		{
			title: "Hành động",
			dataIndex: "action",
			render: (_: any, voucher: any) => (
				<div className="flex flex-wrap gap-4">
					{voucher.isDeleted ? (
						// Hiển thị nút khôi phục nếu voucher đã bị xóa mềm
						<Popconfirm
							title="Khôi phục voucher"
							description="Bạn có chắc muốn khôi phục voucher này không?"
							onConfirm={() => mutationRestoreVoucher.mutate(voucher._id)}
							okText="Yes"
							cancelText="No"
						>
							<Button className="bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300">
								Khôi phục
							</Button>
						</Popconfirm>
					) : (
						// Hiển thị nút xóa mềm nếu voucher chưa bị xóa mềm
						<Popconfirm
							title="Xóa mềm voucher"
							description="Bạn có chắc muốn xóa mềm voucher này không?"
							onConfirm={() => mutationSoftDeleteVoucher.mutate(voucher._id)}
							okText="Yes"
							cancelText="No"
						>
							<Button className="bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-300">
								Xóa mềm
							</Button>
						</Popconfirm>
					)}

					<Popconfirm
						title="Xóa cứng voucher"
						description="Bạn có chắc muốn xóa cứng voucher này không?"
						onConfirm={() => mutationHardDeleteVoucher.mutate(voucher._id)}
						okText="Yes"
						cancelText="No"
					>
						<Button className="bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-300">
							Xóa cứng
						</Button>
					</Popconfirm>
					<Button className="bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-300">
						<Link to={`/admin/voucher/${voucher._id}/update`}>Cập nhật</Link>
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
        _id: item._id
	}));

	if (isLoading) {
		return (
			<div style={{ textAlign: "center", padding: "20px" }}>
				<Spin
					size="large"
					tip="Đang tải dữ liệu..."
				/>
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
					<Button
						type="primary"
						icon={<PlusCircleFilled />}
					>
						<Link
							to="/admin/voucher/add"
							style={{ color: "white" }}
						>
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
