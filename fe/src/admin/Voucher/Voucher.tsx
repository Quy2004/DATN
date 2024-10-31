import {
	Alert,
	Button,
	Descriptions,
	message,
	Modal,
	Popconfirm,
	Select,
	Space,
	Spin,
	Table,
	Typography,
} from "antd";

import { DeleteOutlined, PlusCircleFilled } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Search from "antd/es/input/Search";
import moment from "moment";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import instance from "../../services/api";
import { Voucher } from "../../types/voucher";

const { Title } = Typography;

const { Option } = Select;

const VoucherPage = () => {
	const [messageApi, contextHolder] = message.useMessage();
	const queryClient = useQueryClient();
	const [isDelete, setIsDelete] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1); // State cho phân trang
	const [pageSize, setPageSize] = useState(10); // Số lượng mục trên mỗi trang

	const navigate = useNavigate();
	const location = useLocation();
	const params = new URLSearchParams(location.search);
	// Hàm cập nhật URL khi có thay đổi bộ lọc và phân trang

	const updateUrlParams = () => {
		const searchParams = new URLSearchParams();
		if (searchTerm) params.set("search", searchTerm);

		if (isDelete) {
			params.set("isDelete", "true");
		} else {
			params.delete("isDelete");
		}
		params.set("page", currentPage.toString());
		params.set("limit", pageSize.toString());
		navigate({ search: params.toString() }, { replace: true });
	};

	useEffect(() => {
		updateUrlParams();
	}, [isDelete, searchTerm, currentPage, pageSize]);

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["vouchers", isDelete, searchTerm, currentPage, pageSize],
		queryFn: async () => {
			try {
				const trashParam = isDelete ? `&isDeleted=true` : "";
				const response = await instance.get(
					`/vouchers?${trashParam}${searchTerm}&page=${currentPage}&limit=${pageSize}`,
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

	// // Xử lý thay đổi trạng thái bộ lọc
	// const handleFilterChange = (value: string) => {
	// 	setIsDelete(value);
	// 	setCurrentPage(1);
	// };
	const handleSearch = (value: string) => {
		setSearchTerm(value);
		setCurrentPage(1);
	};
	// Xử lý thay đổi phân trang
	const handleTableChange = (pagination: any) => {
		setCurrentPage(pagination.current); // Cập nhật trang hiện tại
		setPageSize(pagination.pageSize); // Cập nhật số lượng mỗi trang
	};

	const showModal = (Voucher: Voucher) => {
		setSelectedVoucher(Voucher);
		setIsModalVisible(true);
	};

	const handleCloseModal = () => {
		setIsModalVisible(false);
		setSelectedVoucher(null);
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
			render: (text: string, size: Voucher) => (
				<span
					onClick={() => showModal(size)}
					className="text-gray-950 cursor-pointer hover:text-blue-700"
				>
					{text}
				</span>
			),
		},
		{
			title: "Phần trăm giảm giá",
			dataIndex: "discountPercentage",
			key: "discountPercentage",
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
			render: (text: any) => moment(text).format("DD/MM/YYYY HH:mm"),
		},
		{
			title: "Ngày kết thúc",
			dataIndex: "maxOrderDate",
			key: "maxOrderDate",
			render: (text: any) => moment(text).format("DD/MM/YYYY HH:mm"),
		},
		{
			title: "Trạng thái",
			dataIndex: "status",
			key: "status",
			render: (status: any) => {
				switch (status) {
					case "upcoming":
						return "Chưa bắt đầu";
					case "active":
						return "Đang hoạt động";
					case "unactive":
						return "Đã kết thúc";
					default:
						return status; // Trả về giá trị gốc nếu không khớp
				}
			},
		},

		{
			title: "Hành động",
			key: "action",
			render: (_: string, voucher: Voucher) => (
				<Space size="middle">
					{isDelete ? (
						<>
							<Popconfirm
								title="Khôi phục voucher"
								description="Bạn có chắc chắn muốn khôi phục voucher này?"
								onConfirm={() => mutationRestoreVoucher.mutate(voucher._id)}
								okText="Có"
								cancelText="Không"
							>
								<Button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all">
									Khôi phục
								</Button>
							</Popconfirm>
							<Popconfirm
								title="Xóa cứng voucher"
								description="Bạn có chắc chắn muốn xóa voucher này vĩnh viễn?"
								onConfirm={() => mutationHardDeleteVoucher.mutate(voucher._id)}
								okText="Có"
								cancelText="Không"
							>
								<Button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all">
									Xóa vĩnh viễn
								</Button>
							</Popconfirm>
						</>
					) : (
						<>
							<Popconfirm
								title="Xóa mềm voucher"
								description="Bạn có chắc chắn muốn xóa mềm voucher này?"
								onConfirm={() => mutationSoftDeleteVoucher.mutate(voucher._id)}
								okText="Có"
								cancelText="Không"
							>
								<Button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all">
									Xóa
								</Button>
							</Popconfirm>
							<Link to={`/admin/voucher/${voucher._id}/update`}>
								<Button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all">
									Cập nhật
								</Button>
							</Link>
						</>
					)}
				</Space>
			),
		},
	];

	const dataSource = data?.data?.map((item: any, index: number) => ({
		key: index + 1,
		name: item.name,
		code: item.code,
		description: item.description,
		status: item.status,
		discountPercentage: item.discountPercentage,
		quantity: item.quantity,
		minOrderDate: item.minOrderDate,
		maxOrderDate: item.maxOrderDate,
		isDeleted: item.isDeleted,
		_id: item._id,
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
					<Button
						type="primary"
						icon={<DeleteOutlined />}
						onClick={() => setIsDelete(!isDelete)}
					>
						{isDelete ? "" : ""}
					</Button>
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

			<Modal
				title="Chi tiết Voucher"
				open={isModalVisible}
				onCancel={handleCloseModal}
				footer={null}
				width={800}
				className="fixed mt-[-90px] ml-[321px]"
			>
				{selectedVoucher && (
					<div className="p-5">
						<Descriptions
							bordered
							column={2}
						>
							<Descriptions.Item
								label="Tên size"
								span={2}
							>
								<span className="font-semibold text-lg text-gray-900">
									{selectedVoucher.name}
								</span>
							</Descriptions.Item>
						</Descriptions>

						<Descriptions
							bordered
							column={2}
						>
							<Descriptions.Item
								label="Mã code"
								span={2}
							>
								<span className="font-semibold  text-gray-900">
									{selectedVoucher.code}
								</span>
							</Descriptions.Item>
						</Descriptions>

						<Descriptions
							bordered
							column={2}
						>
							<Descriptions.Item
								label="Mô tả"
								span={2}
							>
								<span className="font-semibold  text-gray-900">
									{selectedVoucher.description}
								</span>
							</Descriptions.Item>
						</Descriptions>

						<Descriptions
							bordered
							column={2}
						>
							<Descriptions.Item
								label="Phần trăm giảm giá"
								span={2}
							>
								<span className="font-semibold  text-gray-900">
									{selectedVoucher.discountPercentage} %
								</span>
							</Descriptions.Item>
						</Descriptions>

						<Descriptions
							bordered
							column={2}
						>
							<Descriptions.Item
								label="Giảm giá tối đa"
								span={2}
							>
								<span className="font-semibold  text-gray-900">
									{selectedVoucher.maxDiscount}
								</span>
							</Descriptions.Item>
						</Descriptions>

						<Descriptions
							bordered
							column={2}
						>
							<Descriptions.Item
								label="Số lượng"
								span={2}
							>
								<span className="font-semibold  text-gray-900">
									{selectedVoucher.quantity}
								</span>
							</Descriptions.Item>
						</Descriptions>

						<Descriptions
							bordered
							column={2}
						>
							<Descriptions.Item
								label="Ngày bắt đầu"
								span={2}
							>
								<span className="font-semibold text-gray-900">
									{selectedVoucher && selectedVoucher.minOrderDate
										? new Date(selectedVoucher.minOrderDate).toLocaleDateString(
												"vi-VN",
												{
													year: "numeric",
													month: "2-digit",
													day: "2-digit",
													hour: "2-digit",
													minute: "2-digit",
													hour12: false, // Đảm bảo sử dụng định dạng 24 giờ
												},
										  )
										: "Không có dữ liệu"}
								</span>
							</Descriptions.Item>
						</Descriptions>

						<Descriptions
							bordered
							column={2}
						>
							<Descriptions.Item
								label="Ngày kết thúc"
								span={2}
							>
								<span className="font-semibold text-gray-900">
									{selectedVoucher && selectedVoucher.minOrderDate
										? new Date(selectedVoucher.maxOrderDate).toLocaleDateString(
												"vi-VN",
												{
													year: "numeric",
													month: "2-digit",
													day: "2-digit",
													hour: "2-digit",
													minute: "2-digit",
													hour12: false, // Đảm bảo sử dụng định dạng 24 giờ
												},
										  )
										: "Không có dữ liệu"}
								</span>
							</Descriptions.Item>
						</Descriptions>

						<Descriptions
							bordered
							column={2}
						>
							<Descriptions.Item
								label="Trạng thái"
								span={2}
							>
								<span className="font-semibold text-gray-900">
									{(() => {
										switch (selectedVoucher.status) {
											case "upcoming":
												return "Chưa bắt đầu";
											case "active":
												return "Đang hoạt động";
											case "unactive":
												return "Đã kết thúc";
											default:
												return "Không xác định"; // Nếu trạng thái không hợp lệ
										}
									})()}
								</span>
							</Descriptions.Item>
						</Descriptions>
					</div>
				)}
			</Modal>
		</>
	);
};

export default VoucherPage;
