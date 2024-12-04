import {
	CheckOutlined,
	CloseOutlined,
	LockOutlined,
	PlusCircleFilled,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Alert,
	Button,
	Descriptions,
	Form,
	FormProps,
	Image,
	Input,
	message,
	Modal,
	Popconfirm,
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
	const [isModalRep, setIsModalRep] = useState(false);
	const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
	const [isDeleted, setIsDeleted] = useState(false);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [currentPage, setCurrentPage] = useState(1);
	const [pageComment, setPageComment] = useState(10);
	const [selectedProduct, setSelectedProduct] = useState<string | undefined>(
		undefined,
	);
	const [parentId, setParentId] = useState<string | null>(null);

	const [form] = Form.useForm();
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
	}, [
		searchTerm,
		currentPage,
		pageComment,
		isDeleted,
		selectedProduct,
		navigate,
	]);

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
	const { data: products } = useQuery({
		queryKey: ["product"],
		queryFn: async () => {
			const response = await instance.get(`products`);
			return response.data;
		},
	});

	// hiển thị sản phẩm
	const { data: repComment } = useQuery({
		queryKey: ["comment", parentId],
		queryFn: async () => {
			const response = await instance.get(`/comment/parent/${parentId}`);
			return response.data;
		},
		enabled: !!parentId, // Chỉ gọi API khi có parentId
	});
	console.log("rep", parentId); // Kiểm tra dữ liệu của repComment

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
	//trả lời bình luận
	const { mutate } = useMutation({
		mutationFn: async (size: Comment) => {
			// Lấy dữ liệu từ trường content và gán vào content
			const replyData = {
				...size, // Giữ lại các trường hiện tại trong size
				content: size.content, // Nội dung trả lời
				parent_id: size.id, // Gán parent_id từ trường id trong form
				product_id: size.productId
			};

			// Gửi request với nội dung đã được thay đổi
			return await instance.post(`/comment`, replyData);
		},
		onSuccess: () => {
			messageApi.success("Thêm bình luận thành công");
			
			queryClient.invalidateQueries({ queryKey: ["comment"] });
			// Reset form sau khi thêm thành công
			form.resetFields();
			// Chuyển hướng về trang quản lý bình luận
			
		},
		onError(error) {
			messageApi.error(`Lỗi: ${error.message}`);
		},
	});

	const mutationSoftDelete = useMutation<void, Error, string>({
		mutationFn: async (_id: string) => {
			try {
				return await instance.patch(`/comment/${_id}/soft-delete`);
			} catch (error) {
				throw new Error("Xóa bình luận thất bại");
			}
		},
		onSuccess: () => {
			messageApi.success("Xóa bình luận thành công");
			queryClient.invalidateQueries({ queryKey: ["comment"] });
		},
		onError: error => {
			messageApi.error(`Lỗi: ${error.message}`);
		},
	});

	// Hàm để hiển thị chi tiết sản phẩm trong Modal
	const showModal = (comment: Comment) => {
		setSelectedComment(comment); // Lưu sản phẩm được chọn
		setParentId(comment._id);
		setIsModalVisible(true); // Mở Modal
	};

	// Hàm để đóng Modal
	const handleCloseModal = () => {
		setIsModalVisible(false);
		setSelectedComment(null); // Reset sản phẩm khi đóng Modal
	};
	// Hàm để hiển thị chi tiết sản phẩm trong Modal
	const showModalRep = (comment: Comment) => {
		setSelectedComment(comment); // Lưu sản phẩm được chọn
		setIsModalRep(true); // Mở Modal
	};

	// Hàm để đóng Modal
	const handleCloseModalRep = () => {
		setIsModalRep(false);
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
					{!size.isDeleted && (
						<Button
							onClick={() => showModalRep(size)}
							className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all"
						>
							Trả lời
						</Button>
					)}
				</Space>
			),
		},
	];

	const dataSource = comments?.data?.map((item: Comment, index: number) => ({
		key: index + 1,
		content: item.content,
		userName: item.user_id.userName,
		product: item.product_id,
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

	const onFinish: FormProps<Comment>["onFinish"] = values => {
		const replyContent = {
			...values, // Giữ lại các trường hiện tại trong values
			content: values.content, // Chỉ gán giá trị của content vào trường content
			// Bạn có thể bỏ qua repcontent vì không cần phải thay đổi nó
		};

		console.log("Success:", replyContent);

		// Gửi giá trị đã cập nhật lên server
		mutate(replyContent);
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
				title="Trả lời bình luận"
				open={isModalRep}
				onCancel={handleCloseModalRep}
				footer={null}
				width={800}
			>
				{selectedComment && (
					<div>
						<Form
							name="replyForm"
							labelCol={{ span: 8 }}
							wrapperCol={{ span: 16 }}
							style={{ maxWidth: 600 }}
							autoComplete="off"
							form={form}
							onFinish={onFinish}
							initialValues={{
								repcontent: selectedComment.content, // Nội dung bình luận hiển thị ở đây
								userName: selectedComment.userName, // Tên người dùng
								name: selectedComment.name, // Tên sản phẩm
								id: selectedComment._id, // ID của bình luận
							}}
						>
							<Form.Item
								label="id comment"
								name="id"
								className="hidden"
							>
								<Input
									disabled
									className="Input-antd text-sm placeholder-gray-400"
									style={{ color: "black" }}
								/>
							</Form.Item>

							<Form.Item
								label="Tên người dùng"
								name="userName"
							>
								<Input
									disabled
									className="Input-antd text-sm placeholder-gray-400"
									style={{ color: "black" }}
								/>
							</Form.Item>

							<Form.Item
								label="Tên sản phẩm"
								name="name"
							>
								<Input
									disabled
									className="Input-antd text-sm placeholder-gray-400"
									style={{ color: "black" }}
								/>
							</Form.Item>

							<Form.Item
								label="Nội dung bình luận"
								name="repcontent"
							>
								<Input.TextArea
									disabled
									className="Input-antd text-sm placeholder-gray-400"
									style={{ color: "black" }}
									rows={4}
								/>
							</Form.Item>

							<Form.Item
								label="Trả lời"
								name="content"
								rules={[
									{
										required: true,
										message: "Vui lòng nhập nội dung trả lời!",
									},
								]}
							>
								<Input.TextArea
									className="Input-antd text-sm placeholder-gray-400"
									style={{ color: "black" }}
									rows={4}
								/>
							</Form.Item>

							<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
								<Button
									type="primary"
									htmlType="submit"
								>
									Trả lời
								</Button>
							</Form.Item>
						</Form>
					</div>
				)}
			</Modal>

			<Modal
				title="Chi tiết bình luận"
				open={isModalVisible}
				onCancel={handleCloseModal}
				footer={null}
				width={800}
				className="mt-[-90px] ml-[25%] max-h-[630px] fixed overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
			>
				{selectedComment && (
					<div
						className="p-5"
						key={selectedComment._id}
					>
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
										Array.isArray(selectedComment.image) &&
										selectedComment.image.length > 0
											? selectedComment.image[0]
											: "/path/to/placeholder-image.jpg" // Use a placeholder if no image exists
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

							<Descriptions.Item
								label="Trả lời của người bán"
								span={2}
							>
								<div className="space-y-2">
									{Array.isArray(repComment) && repComment.length > 0 ? (
										repComment.map((reply, index) => (
											<div className="flex ">
												<div
													key={index}
													className="font-semibold text-sm border-b border-gray-300 w-[90%]"
												>
													{reply.content}
												</div>
												<Popconfirm
													title="Xóa bình luận"
													description="Bạn có chắc muốn xóa bình luận này không?"
													onConfirm={() =>
														mutationSoftDelete.mutate(reply._id)
													}
													okText="Yes"
													cancelText="No"
												>
													<Button className="bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-300">
														Xóa
													</Button>
												</Popconfirm>
											</div>
										))
									) : (
										<span className="font-semibold text-lg text-gray-900">
											Không có trả lời
										</span>
									)}
								</div>
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
