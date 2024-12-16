import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Button,
	Form,
	FormProps,
	Input,
	message,
	Modal,
	Popconfirm,
} from "antd";
import { useParams } from "react-router-dom";
import instance from "../../../services/api";
import { useEffect, useState } from "react";
import { Comment } from "../../../types/comment";
import toast from "react-hot-toast";

const Detail = () => {
	const { id } = useParams(); // Lấy ID của bình luận từ URL
	const queryClient = useQueryClient();
	const [messageApi, contextHolder] = message.useMessage();
	const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
	const [isModalRep, setIsModalRep] = useState(false);
	const [repComment, setRepComment] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [form] = Form.useForm(); // Form instance

	// Fetch chi tiết bình luận
	const {
		data: comment,
		isLoading: isCommentLoading,
		error: commentError,
	} = useQuery({
		queryKey: ["comment", id],
		queryFn: async () => {
			const response = await instance.get(`comment/${id}`);
			return response.data.data; // Đảm bảo trỏ đúng tới dữ liệu trong response
		},
		enabled: !!id, // Chỉ fetch khi có ID
	});

	const fetchComments = async () => {
		if (!id) return; // Kiểm tra nếu id không tồn tại

		setLoading(true);
		setError(null); // Đặt lỗi về null trước khi gọi API

		try {
			const response = await instance.get(`/comment/parent/${id}`);
			setRepComment(response.data); // Giả sử dữ liệu trả về là mảng
		} catch (err) {
			console.error("Lỗi khi gọi API:", err);
			setError(err); // Cập nhật trạng thái lỗi
		} finally {
			setLoading(false); // Kết thúc trạng thái tải
		}
	};
	useEffect(() => {
		fetchComments();
	}, [id]); // Chạy lại khi id thay đổi
	console.log("repComment:", repComment);

	const { mutate } = useMutation({
		mutationFn: async (size: Comment) => {
			// Lấy dữ liệu từ trường content và gán vào content
			const replyData = {
				...size, // Giữ lại các trường hiện tại trong size
				content: size.content, // Nội dung trả lời
				parent_id: id, // Gán parent_id từ trường id trong form
				product_id: size.productId,
			};

			// Gửi request với nội dung đã được thay đổi
			return await instance.post(`/comment`, replyData);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["comment"] });
			// Reset form sau khi thêm thành công
			form.resetFields();
			// Chuyển hướng về trang quản lý bình luận
			fetchComments();
		},
		onError(error) {
			messageApi.error(`Lỗi: ${error.message}`);
		},
	});

	const mutationSoftDelete = useMutation<void, Error, string>({
		mutationFn: async (_id: string) => {
			try {
				return await instance.delete(`/comment/${_id}`);
			} catch (error) {
				throw new Error("Xóa bình luận thất bại");
			}
		},
		onSuccess: () => {
			messageApi.success("Xóa bình luận thành công");
			fetchComments();
			queryClient.invalidateQueries({ queryKey: ["comment"] });
		},
		onError: error => {
			messageApi.error(`Lỗi: ${error.message}`);
		},
	});

	// Khi dữ liệu đang tải hoặc có lỗi
	if (isCommentLoading) return <div>Đang tải dữ liệu...</div>;
	if (commentError) return <div>Có lỗi xảy ra khi tải dữ liệu!</div>;

	// Kiểm tra dữ liệu trả về
	if (!comment) return <div>Không tìm thấy bình luận.</div>;

	// Show Modal Reply
	const showModalRep = (comment: Comment) => {
		setSelectedComment(comment); // Lưu bình luận được chọn
		setIsModalRep(true); // Mở Modal
	};

	// Hàm để đóng Modal
	const handleCloseModalRep = () => {
		setIsModalRep(false);
		setSelectedComment(null); // Reset bình luận khi đóng Modal
	};

	const onFinish: FormProps<Comment>["onFinish"] = values => {
		const replyContent = {
			...values, // Giữ lại các trường hiện tại trong values
			content: values.content, // Chỉ gán giá trị của content vào trường content
		};

		toast.success("Bạn đã trả lời bình luận thành công", {
			className: "mx-auto text-center", // Căn giữa thông báo và văn bản
		});

		// Gửi giá trị đã cập nhật lên server
		mutate(replyContent);
	};

	return (
		<div className="bg-white p-6">
			{contextHolder}
			<h1 className="text-3xl font-semibold text-center mb-6">
				Chi tiết bình luận
			</h1>

			<div className="mx-auto mt-5 rounded-lg p-6 overflow-auto max-h-[400px] w-[98%] border shadow-sm">
				{/* Thông tin tài khoản */}
				<div className="border-b pb-4 mb-6">
					<h2 className="text-xl font-semibold text-gray-800 mb-2">
						Thông tin người dùng
					</h2>
					<p className="text-gray-600">
						<span className="font-medium">Tên:</span>{" "}
						{comment.user_id?.userName || "Không có thông tin"}
					</p>
					<p className="text-gray-600">
						<span className="font-medium">Email:</span>{" "}
						{comment.user_id?.email || "Không có thông tin"}
					</p>
				</div>

				{/* Thông tin sản phẩm */}
				<div className="border-b pb-4 mb-6">
					<h2 className="text-xl font-semibold text-gray-800 mb-2">
						Thông tin sản phẩm
					</h2>
					<div className="flex items-start">
						{comment.product_id?.image && (
							<img
								src={comment.product_id.image}
								alt={comment.product_id.name}
								className="w-32 h-32 object-cover rounded-lg shadow-sm border"
							/>
						)}
						<div className="ml-5 text-lg">
							<p className="font-semibold mb-2">
								Tên sản phẩm: {comment.product_id?.name || "Không có thông tin"}
							</p>
							<p className="text-gray-600">
								Giá:{" "}
								{comment.product_id?.price
									? `${comment.product_id.price.toLocaleString()} VNĐ`
									: "Không có thông tin"}
							</p>
						</div>
					</div>
				</div>

				{/* Nội dung bình luận */}
				<div className="mb-6">
					<h2 className="text-xl font-semibold text-gray-800 mb-2">
						Nội dung bình luận
					</h2>
					<textarea
						className="w-full p-4 border rounded-lg bg-gray-50 text-gray-800"
						readOnly
						rows="4"
					>
						{comment.content || "Không có nội dung"}
					</textarea>
					{comment.image.length !== 0 && (
						<div className="flex flex-wrap gap-2 mt-4">
							{comment.image?.map((img, idx) => (
								<img
									key={idx}
									src={img}
									alt={`image-${idx}`}
									className="w-16 h-16 object-cover rounded border shadow-sm"
								/>
							))}
						</div>
					)}
				</div>

				{/* Phần trả lời */}
				<div>
					<div className="space-y-4 max-h-[300px] overflow-auto">
						{loading && (
							<div className="text-center text-gray-500">Đang tải...</div>
						)}
						{repComment.length > 0 &&
							repComment.map((reply: Comment) => (
								<div
									className="flex items-start border-b pb-4"
									key={reply._id}
								>
									<div className="ml-3 w-full">
										<p className="font-semibold text-gray-800">
											COVY HAVEN
										</p>
										<div className="flex">
											<p className="w-[70%] ml-5 mt-2 text-gray-700">
												{reply.content}
											</p>
											<Popconfirm
												className=" w-[30%]"
												title="Xóa bình luận"
												description="Bạn có chắc muốn xóa bình luận này không?"
												onConfirm={() => mutationSoftDelete.mutate(reply._id)}
												okText="Yes"
												cancelText="No"
											>
												{/* Nút trả lời */}
												<div className="flex justify-end items-center gap-x-2">
													{/* Nút xóa trả lời admin */}
													<Button className="bg-red-600 text-white">Xóa</Button>
												</div>
											</Popconfirm>
										</div>
									</div>
								</div>
							))}
						<Button
							onClick={() => showModalRep(comment)}
							className="bg-blue-600 text-white"
						>
							Trả lời
						</Button>
					</div>
				</div>
			</div>
			{/* Modal Trả lời */}
			<Modal
				title="Trả lời bình luận"
				open={isModalRep}
				onCancel={handleCloseModalRep}
				footer={null}
				width={800}
				className="ml-[340px]"
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
								repcontent: selectedComment.content,
								userName: comment.user_id?.userName,
								name: comment.product_id?.name,
								id: selectedComment._id,
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
									className="bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-green-300 text-white rounded"
								>
									Trả lời
								</Button>
							</Form.Item>
						</Form>
					</div>
				)}
			</Modal>
		</div>
	);
};

export default Detail;
