import {
	CheckOutlined,
	CloseOutlined,
	LockOutlined,
	PlusCircleFilled,
} from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Alert,
	Button,
	Descriptions,
	Image,
	message,
	Modal,
	Select,
	Space,
	Spin,
	Switch,
	Table,
	Tooltip,
} from "antd";
import Search from "antd/es/input/Search";
import Title from "antd/es/typography/Title";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import instance from "../../services/api";
import { Comment } from "../../types/comment";
import { Product } from "../../types/product";

const CommentAdmin = () => {
	const queryClient = useQueryClient();
	const [messageApi, contextHolder] = message.useMessage();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
	const [isDeleted, setIsDeleted] = useState(false);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [currentPage, setCurrentPage] = useState(1);
	const [pageComment, setPageComment] = useState(10);
	const [selectedProduct, setSelectedProduct] = useState<string | undefined>(
		undefined,
	);

	const navigate = useNavigate();

	const updateUrlParams = useCallback(() => {
		const params = new URLSearchParams();
		if (searchTerm) params.set("search", searchTerm);

		if (isDeleted) {
			params.set("isDeleted", "true");
		} else {
			params.delete("isDeleted");
		}
		if (selectedProduct && selectedProduct !== "allProduct") {
			params.set("productId", selectedProduct);
		}
		params.set("page", currentPage.toString());
		params.set("limit", pageComment.toString());
		navigate({ search: params.toString() }, { replace: true });
	}, [searchTerm, currentPage, pageComment, isDeleted,  selectedProduct, navigate]);

	useEffect(() => {
		updateUrlParams();
	}, [
		searchTerm,
		currentPage,
		pageComment,
		isDeleted,
		
		selectedProduct,
		updateUrlParams,
	]);

	const {
		data: comments,
		isLoading,
		isError,
	} = useQuery({
		queryKey: [
			"comment",
			searchTerm,
			currentPage,
			pageComment,
			isDeleted,
			
			selectedProduct,
		],
		queryFn: async () => {
			const productParam =
				selectedProduct && selectedProduct !== "allProduct"
					? `&productId=${selectedProduct}`
					: "";
			const trashParam = isDeleted ? `&isDeleted=true` : "";
			const response = await instance.get(
				`comment?search=${searchTerm}&page=${currentPage}&limit=${pageComment}${trashParam}${productParam}`,
			);
			return response.data;
		},
	});

	// hiển thị sản phẩm
	const {
		data: products
	} = useQuery({
		queryKey: [
			"comment",
		],
		queryFn: async () => {
			const response = await instance.get(
				`products`,
			);
			return response.data;
		},
	});

	// trạng thái comment
	const handleStatusChange = async (checked: boolean, id: string) => {
		try {
			const isDeleted = checked; // Nếu checked là true, thì isDeleted là true, ngược lại là false

			// Gọi API để cập nhật isDeleted
			await instance.patch(`/comment/${id}/update`, {
				isDeleted, // Truyền isDeleted thay vì status
			});

			message.success("Cập nhật trạng thái sản phẩm thành công!");
			queryClient.invalidateQueries({
				queryKey: ["comment"],
			});
		} catch (error) {
			message.error("Lỗi khi cập nhật trạng thái!");
		}
	};

	// Hàm để hiển thị chi tiết sản phẩm trong Modal
	const showModal = (comment: Comment) => {
		setSelectedComment(comment); // Lưu sản phẩm được chọn
		setIsModalVisible(true); // Mở Modal
	};

	// Hàm để đóng Modal
	const handleCloseModal = () => {
		setIsModalVisible(false);
		setSelectedComment(null); // Reset sản phẩm khi đóng Modal
	};

	const columns = [
		{
			title: "STT",
			dataIndex: "key",
			ket: "key",
			width: 60,
		},
		{
			title: "Tên sản phẩm",
			dataIndex: "name",
			key: "name",
			width: 200,
			render: (text: string, comment: Comment) => (
				<Tooltip title="Xem thêm thông tin">
					<span
						onClick={() => showModal(comment)}
						className="text-gray-950 cursor-pointer hover:text-blue-700"
					>
						{text}
					</span>
				</Tooltip>
			),
		},
		{
			title: "Tên người dùng",
			dataIndex: "userName",
			key: "userName",
			width: 150,
		},
		{
			title: "Nội dung",
			dataIndex: "content",
			key: "content",
		},
		{
			title: "Trạng Thái",
			dataIndex: "isDeleted",
			key: "isDeleted",
			width: 100,
			render: (isDeleted: boolean, record: Comment) => (
				<div className="flex items-center space-x-2">
					{/* Tooltip giải thích trạng thái */}
					<Tooltip
						title={isDeleted ? "Bình luận đã bị khóa" : "Bình luận hoạt động"}
					>
						<Switch
							checked={isDeleted} // Nếu isDeleted là true, switch sẽ ở chế độ checked
							onChange={checked => handleStatusChange(checked, record._id)} // Gọi API cập nhật isDeleted
							checkedChildren={<CheckOutlined />}
							unCheckedChildren={<CloseOutlined />}
							style={{
								backgroundColor: isDeleted ? "#f5222d" : "#52c41a", // Đỏ nếu đã xóa, xanh nếu tồn tại
							}}
						/>
					</Tooltip>
				</div>
			),
		},

		{
			title: "Hành động",
			key: "action",
			render: (_: string, size: Comment) => (
				<Space size="middle">
					<Button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all">
						Trả lời
					</Button>
				</Space>
			),
		},
	];

	const dataSource = comments?.data?.map((item: Comment, index: number) => ({
		key: index + 1,
		content: item.content,
		userName: item.user_id.userName,
		name: item.product_id.name,
		status: item.status,
		_id: item._id,
		isDeleted: item.isDeleted,
	}));

	if (isLoading) {
		return (
			<div style={{ textAlign: "center", padding: "50px 0" }}>
				<Spin
					tip="Đang tải dữ liệu..."
					size="large"
				/>
			</div>
		);
	}

	if (isError) {
		return (
			<div style={{ textAlign: "center", padding: "50px 0" }}>
				<Alert
					message="Đã xảy ra lỗi"
					description="Có lỗi trong quá trình tải dữ liệu. Vui lòng thử lại sau."
					type="error"
					showIcon
				/>
			</div>
		);
	}

	const handleSearch = (value: string) => {
		setSearchTerm(value);
		setCurrentPage(1);
	};

	return (
		<div>
			{contextHolder}
			<div className="flex items-center justify-between mb-5">
				<Title level={3}>Danh sách bình luận</Title>

				<div className="flex space-x-3">
					<Search
						placeholder="Tìm kiếm bình luận"
						onSearch={handleSearch}
						allowClear
						style={{ width: 300 }}
					/>
					<Select
						value={selectedProduct}
						onChange={value => setSelectedProduct(value)}
						style={{ width: 150 }}
						placeholder="Chọn sản phẩm"
						options={[
							{ label: "Tất cả", value: "allProduct" },
							...(products?.data?.map((Product: Product) => ({
								label: Product.name,
								value: Product._id,
							})) || []),
						]}
					/>
					<Button
						type="primary"
						icon={<LockOutlined />}
						onClick={() => setIsDeleted(!isDeleted)}
					>
						{isDeleted ? "" : ""}
					</Button>
					<Button
						type="primary"
						icon={<PlusCircleFilled />}
					>
						<Link
							to="/admin/size/add"
							style={{ color: "white" }}
						>
							Thêm bình luận
						</Link>
					</Button>
				</div>
			</div>

			<Table
				dataSource={dataSource}
				columns={columns}
				pagination={{
					current: currentPage,
					pageSize: pageComment,
					total: comments?.pagination?.totalItems || 0,
					showSizeChanger: true,
					pageSizeOptions: ["10", "20", "50", "100"],
					onChange: (page, pageSize) => {
						setCurrentPage(page);
						setPageComment(pageSize);
					},
				}}
				scroll={{ y: 300 }} // Chỉ cần chiều cao
				style={{ tableLayout: "fixed" }} // Giữ chiều rộng ổn định
			/>

			<Modal
				title="Chi tiết size"
				open={isModalVisible}
				onCancel={handleCloseModal}
				footer={null}
				width={800}
			>
				{selectedComment && (
					<div className="p-5">
						<Descriptions
							bordered
							column={2}
							className="bg-gray-50 rounded-lg shadow-sm border border-gray-200"
						>
							<Descriptions.Item
								label="Tên người dùng"
								span={2}
							>
								<span className="font-semibold text-lg text-gray-900">
									{selectedComment.userName}
								</span>
							</Descriptions.Item>

							<Descriptions.Item
								label="Tên sản phẩm"
								span={2}
							>
								<span className="font-semibold text-lg text-gray-900">
									{selectedComment.name}
								</span>
							</Descriptions.Item>

							<Descriptions.Item
								label="Ảnh bình luận"
								span={2}
							>
								<Image
									src={
										Array.isArray(selectedComment.image)
											? selectedComment.image[0]
											: selectedComment.image
									}
									alt="Không có ảnh"
									width={100}
									height={100}
									className="rounded-md border border-gray-200 shadow-sm object-cover"
								/>
							</Descriptions.Item>

							<Descriptions.Item
								label="Nội dung bình luận"
								span={2}
							>
								<span className="font-semibold text-lg text-gray-900">
									{selectedComment.content}
								</span>
							</Descriptions.Item>

							<Descriptions.Item label="Trạng thái">
                <span
                  className={`font-semibold ${
                    selectedComment.isDeleted === false
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {selectedComment.isDeleted === false
                    ? "Hoạt động"
                    : "Đã bị khóa"}
                </span>
              </Descriptions.Item>



						</Descriptions>
					</div>
				)}
			</Modal>
		</div>
	);
};

export default CommentAdmin;
