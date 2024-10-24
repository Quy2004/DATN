import {
	Alert,
	Button,
	Descriptions,
	Image,
	message,
	Modal,
	Popconfirm,
	Select,
	Spin,
	Table,
	Typography,
} from "antd";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Search from "antd/es/input/Search";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import instance from "../../services/api";
import { User } from "../../types/user";

const { Title } = Typography;
const { Option } = Select;

const ClientAdmin = () => {
	const [messageApi, contextHolder] = message.useMessage();
	const queryClient = useQueryClient();
	const [filterStatus, setFilterStatus] = useState("active");
	const [searchTerm, setSearchTerm] = useState("");
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);

	const [filterRole, setFilterRole] = useState("allUser"); // lọc role
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
		searchParams.set("filterRole", filterRole); // Thêm điều kiện vai trò
		searchParams.set("page", currentPage.toString());
		searchParams.set("limit", pageSize.toString());
		navigate({ search: searchParams.toString() });
	};

	useEffect(() => {
		updateUrlParams();
	}, [filterStatus, filterRole, searchTerm, currentPage, pageSize]);

	const { data, isLoading, isError, error } = useQuery({
		queryKey: [
			"user",
			filterStatus,
			filterRole,
			searchTerm,
			currentPage,
			pageSize,
		], // Cập nhật key
		queryFn: async () => {
			try {
				const response = await instance.get(
					`/users?isDeleted=${filterStatus === "deleted"}&all=${
						filterStatus === "all"
					}&search=${searchTerm}&role=${filterRole}&page=${currentPage}&limit=${pageSize}`, // Thêm điều kiện vai trò
				);
				return response.data;
			} catch (error) {
				throw new Error("Lỗi khi tải dữ liệu từ API");
			}
		},
	});

	// Soft delete user
	const mutationSoftDeleteUser = useMutation<void, Error, string>({
		mutationFn: async (_id: string) => {
			try {
				return await instance.patch(`/users/${_id}/soft-delete`);
			} catch (error) {
				throw new Error("Xóa mềm user thất bại");
			}
		},
		onSuccess: () => {
			messageApi.success("Xóa mềm user thành công");
			queryClient.invalidateQueries({ queryKey: ["user"] });
		},
		onError: error => {
			messageApi.error(`Lỗi: ${error.message}`);
		},
	});

	// Restore user
	const mutationRestoreUser = useMutation<void, Error, string>({
		mutationFn: async (_id: string) => {
			try {
				return await instance.patch(`/users/${_id}/restore`);
			} catch (error) {
				throw new Error("Khôi phục user thất bại");
			}
		},
		onSuccess: () => {
			messageApi.success("Khôi phục user thành công");
			queryClient.invalidateQueries({ queryKey: ["user"] });
		},
		onError: error => {
			messageApi.error(`Lỗi: ${error.message}`);
		},
	});

	// Update user role (user API)
	const mutationUpdateUserRole = useMutation<void, Error, { _id: string }>({
		mutationFn: async ({ _id }) => {
			try {
				return await instance.patch(`/users/${_id}/user`);
			} catch (error) {
				throw new Error("Cập nhật vai trò user thất bại");
			}
		},
		onSuccess: () => {
			messageApi.success("Cập nhật vai trò user thành công");
			queryClient.invalidateQueries({ queryKey: ["user"] });
		},
		onError: error => {
			messageApi.error(`Lỗi: ${error.message}`);
		},
	});

	// Update manager role (manager API)
	const mutationUpdateManagerRole = useMutation<void, Error, { _id: string }>({
		mutationFn: async ({ _id }) => {
			try {
				return await instance.patch(`/users/${_id}/manager`);
			} catch (error) {
				throw new Error("Cập nhật vai trò manager thất bại");
			}
		},
		onSuccess: () => {
			messageApi.success("Cập nhật vai trò manager thành công");
			queryClient.invalidateQueries({ queryKey: ["user"] });
		},
		onError: error => {
			messageApi.error(`Lỗi: ${error.message}`);
		},
	});

	// Xử lý thay đổi vai trò
	const handleRoleChange = (_id: string, newRole: string) => {
		if (newRole === "user") {
			mutationUpdateUserRole.mutate({ _id });
		} else if (newRole === "manager") {
			mutationUpdateManagerRole.mutate({ _id });
		} else {
			messageApi.error("Vai trò không hợp lệ");
		}
	};

	// Xử lý thay đổi trạng thái bộ lọc
	const handleFilterChange = (value: string) => {
		setFilterStatus(value);
		setCurrentPage(1);
	};
	const handleRoleFilterChange = (value: string) => {
		setFilterRole(value);
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

	// Hàm để hiển thị chi tiết user trong Modal
	const showModal = (product: User) => {
		setSelectedUser(product); // Lưu user được chọn
		setIsModalVisible(true); // Mở Modal
	};

	// Hàm để đóng Modal
	const handleCloseModal = () => {
		setIsModalVisible(false);
		setSelectedUser(null); // Reset user khi đóng Modal
	};

	const columns = [
		{
			title: "STT",
			dataIndex: "key",
			key: "key",
		},
		{
			title: "Tên user",
			dataIndex: "userName",
			key: "userName",
			render: (text: string, user: User) => (
				<span
					onClick={() => showModal(user)}
					className="text-gray-950 cursor-pointer hover:text-blue-700"
				>
					{text}
				</span>
			),
		},
		{
			title: "Email",
			dataIndex: "email",
			key: "email",
		},
		{
			title: "Hình ảnh",
			dataIndex: "avatar",
			key: "avatar",
			render: (avatar: string) => (
				<img
					src={avatar}
					alt="Avatar"
					style={{ width: 50, height: 50, borderRadius: "50%" }}
				/>
			),
		},

		{
			title: "Vai trò",
			dataIndex: "role",
			key: "role",
			render: (role: string, user: any) => (
				<Select
					value={role}
					onChange={newRole => handleRoleChange(user._id, newRole)} // Gọi hàm thay đổi vai trò
					style={{ width: 150 }}
				>
					<Option value="admin">Admin</Option>
					<Option value="manager">Manager</Option>
					<Option value="user">User</Option>
				</Select>
			),
		},

		{
			title: "Hành động",
			dataIndex: "action",
			render: (_: any, user: any) => (
				<div className="flex flex-wrap gap-4">
					{user.isDeleted ? (
						<Popconfirm
							title="Khôi phục user"
							description="Bạn có chắc muốn mở khóa tài khoản này không?"
							onConfirm={() => mutationRestoreUser.mutate(user._id)}
							okText="Yes"
							cancelText="No"
						>
							<Button className="bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300">
								Mở khóa
							</Button>
						</Popconfirm>
					) : (
						<Popconfirm
							title="Khóa user"
							description="Bạn có chắc muốn khóa tài khoản này không?"
							onConfirm={() => mutationSoftDeleteUser.mutate(user._id)}
							okText="Yes"
							cancelText="No"
						>
							<Button className="bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-300">
								Khóa tài khoản
							</Button>
						</Popconfirm>
					)}
				</div>
			),
		},
	];

	const dataSource = data?.data?.map((item: any, index: number) => ({
		_id: item._id,
		key: index + 1,
		userName: item.userName,
		email: item.email,
		avatar: item.avatar,
		role: item.role,
		isDeleted: item.isDeleted,
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
				<Title level={3}>Danh sách user</Title>

				<div className="flex space-x-3">
					<Search
						placeholder="Tìm kiếm user"
						onSearch={handleSearch}
						allowClear
						style={{ width: 300 }}
					/>
					<Select
						value={filterStatus}
						style={{ width: 200 }}
						onChange={handleFilterChange}
					>
						<Option value="all">Tất cả user</Option>
						<Option value="active">User hoạt động</Option>
						<Option value="deleted">User đã bị khóa</Option>
					</Select>
					<Select
						value={filterRole}
						style={{ width: 200 }}
						onChange={handleRoleFilterChange} // Gọi hàm thay đổi vai trò
					>
						<Option value="allUser">Tất cả vai trò</Option>
						<Option value="admin">Quản lý</Option>
						<Option value="manager">Nhân viên</Option>
						<Option value="user">Người dùng</Option>
					</Select>
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
				title="Chi tiết user"
				open={isModalVisible}
				onCancel={handleCloseModal}
				footer={null}
				width={800}
			>
				{selectedUser && (
					<div className="p-5">
						<Descriptions
							bordered
							column={2}
							className="bg-gray-50 rounded-lg shadow-sm border border-gray-200"
						>
							{/* Tên user */}
							<Descriptions.Item
								label="Tên user"
								span={2}
							>
								<span className="font-semibold text-lg text-gray-900">
									{selectedUser.userName}
								</span>
							</Descriptions.Item>

							{/* email user */}
							<Descriptions.Item
								label="Email user"
								span={2}
							>
								<span className="font-medium text-blue-600">
									{`${selectedUser.email} `}
								</span>
							</Descriptions.Item>

							{/* Ảnh user  */}
							<Descriptions.Item
								label="Avatar user"
								span={2}
							>
								<Image
									src={selectedUser.avatars}
									alt="Ảnh user"
									width={100}
									className="rounded-md border border-gray-200 shadow-sm"
								/>
							</Descriptions.Item>

							{/* trạng thái user */}
							<Descriptions.Item
								label="Trạng thái user"
								span={2}
							>
								<span className="font-semibold">
									{selectedUser.isDeleted ? "Đã bị khóa" : "Hoạt động"}
								</span>
							</Descriptions.Item>

							<Descriptions.Item label="Vai trò">
								<span className="font-semibold">
									{selectedUser.role === "admin"
										? "Admin"
										: selectedUser.role === "user"
										? "Người dùng"
										: selectedUser.role === "manager"
										? "Nhân viên"
										: "Không xác định"}
								</span>
							</Descriptions.Item>
						</Descriptions>
					</div>
				)}
			</Modal>
		</>
	);
};
export default ClientAdmin;
