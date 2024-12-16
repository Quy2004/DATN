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
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import instance from "../../services/api";
import { User } from "../../types/user";
import { DeleteOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title } = Typography;
const { Option } = Select;

const ClientAdmin = () => {
	const [messageApi, contextHolder] = message.useMessage();
	const queryClient = useQueryClient();
	const [isDelete, setIsDelete] = useState(false);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);

	const [filterRole, setFilterRole] = useState("allUser"); // lọc role
	const [currentPage, setCurrentPage] = useState(1); // State cho phân trang
	const [pageSize, setPageSize] = useState(10); // Số lượng mục trên mỗi trang

	const navigate = useNavigate();

	const updateUrlParams = useCallback(() => {
		const params = new URLSearchParams();
		if (searchTerm) params.set("search", searchTerm);
		params.set("filterRole", filterRole); // Thêm điều kiện vai trò
		
		if (isDelete) {
			params.set("isDelete", "true");
		} else {
			params.delete("isDelete");
		}
		params.set("page", currentPage.toString());
		params.set("limit", pageSize.toString());
		navigate({ search: params.toString() }, { replace: true });
	}, [filterRole, searchTerm, currentPage, pageSize, isDelete, navigate]);


	useEffect(() => {
		updateUrlParams();
	}, [ filterRole, searchTerm, currentPage, pageSize]);

	const { data, isLoading, isError, error } = useQuery({
		queryKey: [
			"user",
			isDelete,
			filterRole,
			searchTerm,
			currentPage,
			pageSize,
			updateUrlParams,
		], // Cập nhật key
		queryFn: async () => {
			try {
				const trashParam = isDelete ? `&isDeleted=true` : "";
				const response = await instance.get(
					`/users?&search=${searchTerm}&role=user&page=${currentPage}&limit=${pageSize}${trashParam}`, // Thêm điều kiện vai trò
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
				// Kiểm tra số lượng người dùng có vai trò admin
				const adminCount = await instance.get("/users?role=admin");
				if (adminCount.data.length <= 1) {
					throw new Error("Không thể xóa quyền quản lý vì chỉ còn 1 quản lý");
				}
			
				// Nếu điều kiện trên không vi phạm, tiếp tục gửi yêu cầu PATCH
				return await instance.patch(`/users/${_id}/user`);
			} catch (error: unknown) {
				// Kiểm tra xem lỗi có phải là một lỗi Axios (có thuộc tính `response`)
				if (axios.isAxiosError(error)) {
					// Kiểm tra xem lỗi Axios có chứa dữ liệu response với message hay không
					if (error.response && error.response.data && error.response.data.message) {
						throw new Error(error.response.data.message);  // Lấy thông báo lỗi từ backend
					}
				}
				
				// Nếu không phải lỗi Axios hoặc không có thông báo lỗi, ném lỗi chung
				throw new Error("Cập nhật vai trò user thất bại: " + (error instanceof Error ? error.message : 'Lỗi không xác định'));
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
				return await instance.patch(`/users/${_id}/admin`);
			} catch (error) {
				throw new Error("Cập nhật vai trò quản lý thất bại");
			}
		},
		onSuccess: () => {
			messageApi.success("Cập nhật vai trò quản lý thành công");
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
		} else if (newRole === "admin") {
			mutationUpdateManagerRole.mutate({ _id });
		} else {
			messageApi.error("Vai trò không hợp lệ");
		}
	};

	// Xử lý thay đổi trạng thái bộ lọc
	// const handleFilterChange = (value: string) => {
	// 	setFilterStatus(value);
	// 	setCurrentPage(1);
	// };
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
			width: 60,
		},
		{
			title: "Tên người dùng",
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
			width: 250,
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
					// onChange={newRole => handleRoleChange(user._id, newRole)} // Gọi hàm thay đổi vai trò
					style={{ width: 150 }}
				>
					<Option value="admin">Admin</Option>
					{/* <Option value="manager">Manager</Option> */}
					<Option value="user">User</Option>
				</Select>
			),
		},

		
	];

	const dataSource = data?.data?.map((item: any, index: number) => ({
		_id: item._id,
		key: index + 1,
		userName: item.userName,
		email: item.email,
		avatar: item.avatars[0].url,
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
				<Title level={3}>Danh sách tài khoản</Title>

				<div className="flex space-x-3">
					<Search
						placeholder="Tìm kiếm tài khoản"
						onSearch={handleSearch}
						allowClear
						style={{ width: 300 }}
					/>
					{/* <Button
						type="primary"
						icon={<DeleteOutlined />}
						onClick={() => setIsDelete(!isDelete)}
					>
						{isDelete ? "" : ""}
					</Button> */}
					{/* <Select
						value={filterRole}
						style={{ width: 200 }}
						onChange={handleRoleFilterChange} // Gọi hàm thay đổi vai trò
					>
						<Option value="allUser">Tất cả vai trò</Option>
						<Option value="admin">Quản lý</Option>
						<Option value="manager">Nhân viên</Option>
						<Option value="user">Người dùng</Option>
					</Select> */}
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
				
				scroll={{ y: 300 }} // Chỉ cần chiều cao
				style={{ tableLayout: "fixed"}} // Giữ chiều rộng ổn định
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
								label="Tên người dùng"
								span={2}
							>
								<span className="font-semibold text-lg text-gray-900">
									{selectedUser.userName}
								</span>
							</Descriptions.Item>

							{/* email user */}
							<Descriptions.Item
								label="Email người dùng"
								span={2}
							>
								<span className="font-medium text-blue-600">
									{`${selectedUser.email} `}
								</span>
							</Descriptions.Item>

							{/* Ảnh user  */}
							<Descriptions.Item
								label="Ảnh người dùng"
								span={2}
							>
								<Image
									src={selectedUser.avatars}
									alt="Ảnh người dùng"
									width={100}
									className="rounded-md border border-gray-200 shadow-sm"
								/>
							</Descriptions.Item>

							{/* trạng thái user */}
							<Descriptions.Item
								label="Trạng thái"
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
										// : selectedUser.role === "manager"
										// ? "Nhân viên"
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
