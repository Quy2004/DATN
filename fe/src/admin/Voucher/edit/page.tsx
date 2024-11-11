import { BackwardFilled } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Button,
	DatePicker,
	Form,
	Input,
	InputNumber,
	message,
	Select,
	Spin,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import instance from "../../../services/api";
import { Voucher } from "../../../types/voucher";
import ReactQuill from "react-quill";
import { Category } from "../../../types/category";
import { Product } from "../../../types/product";

const VoucherUpdatePage = () => {
	const { id } = useParams(); // Lấy id voucher từ URL
	const navigate = useNavigate(); // Dùng để chuyển hướng sau khi cập nhật
	const [messageApi, contextHolder] = message.useMessage();
	const [form] = Form.useForm();
	const queryClient = useQueryClient();
	const [selectedType, setSelectedType] = useState<string | null>(null); // Chỉ có thể chọn 1 loại

	// Truy vấn để lấy dữ liệu voucher hiện tại
	const { data: voucherData, isLoading: isvoucherLoading } = useQuery({
		queryKey: ["voucher", id],
		queryFn: async () => {
			const response = await instance.get(`/vouchers/${id}`); // Lấy thông tin voucher từ API
			return response.data.data;
		},
		enabled: !!id, // Chỉ chạy truy vấn nếu có id
	});

	// Kết nối đến bảng category
	const { data: categories, isLoading: isLoadingCategories } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			const response = await instance.get(`/categories`);
			return response.data;
		},
	});

	// Kết nối đến bảng products
	const { data: products, isLoading: isLoadingProducts } = useQuery({
		queryKey: ["products"],
		queryFn: async () => {
			const response = await instance.get(`/products`);
			return response.data;
		},
	});

	useEffect(() => {
		if (voucherData) {
			form.setFieldsValue({
				name: voucherData.name,
				code: voucherData.code,
				description: voucherData.description,
				discountPercentage: voucherData.discountPercentage,
				maxDiscount: voucherData.maxDiscount,
				quantity: voucherData.quantity,
				minOrderDate: dayjs(voucherData.minOrderDate),
				maxOrderDate: dayjs(voucherData.maxOrderDate),
				applicableCategories: voucherData.applicableCategories,
				applicableProducts: voucherData.applicableProducts,
			});

			// Kiểm tra xem có categories và products không để tự động chọn loại
			if (voucherData.applicableCategories.length > 0) {
				setSelectedType("category"); // Tự động chọn "Chọn danh mục"
			} else if (voucherData.applicableProducts.length > 0) {
				setSelectedType("product"); // Tự động chọn "Chọn sản phẩm"
			}
		}
	}, [voucherData, form]);

	// Mutation để cập nhật voucher
	const { mutate } = useMutation({
		mutationFn: async (voucher: Voucher) => {
			return await instance.put(`/vouchers/${id}`, voucher); // Gửi yêu cầu cập nhật voucher
		},
		onSuccess: () => {
			messageApi.success("Cập nhật voucher thành công");
			queryClient.invalidateQueries({ queryKey: ["voucher", id] }); // Làm mới truy vấn voucher
			// Chuyển hướng về trang quản lý voucher
			setTimeout(() => {
				navigate("/admin/voucher");
			}, 2000);
		},
		onError(error: any) {
			messageApi.error(`Lỗi: ${error.message}`);
		},
	});

	// Xử lý khi submit form
	const onFinish = (values: Voucher) => {
		// Kiểm tra xem có loại nào được chọn không
		if (!selectedType) {
			// Nếu không chọn loại, gán các trường applicableCategories và applicableProducts thành mảng rỗng
			values.applicableCategories = [];
			values.applicableProducts = [];
		}

		mutate(values); // Gọi mutation để cập nhật voucher
	};

	// Hiển thị loading khi dữ liệu chưa sẵn sàng
	if (isvoucherLoading) {
		return (
			<div style={{ textAlign: "center", padding: "50px" }}>
				<Spin
					size="large"
					tip="Đang tải dữ liệu..."
				/>
			</div>
		);
	}

	// Hàm xử lý chọn loại
	const handleTypeSelect = (type: string) => {
		setSelectedType(type === selectedType ? null : type); // Chỉ chọn 1 loại
		// Clear dữ liệu trong các input khi không chọn loại
		form.setFieldsValue({
			applicableCategories: [], // Xóa dữ liệu trong Select danh mục
			applicableProducts: [], // Xóa dữ liệu trong Select sản phẩm
			code: "", // Xóa dữ liệu trong input mã voucher
		});
	};

	const generateRandomCode = () => {
		const randomCode = Math.random()
			.toString(36)
			.substring(2, 10)
			.toUpperCase(); // Tạo mã gồm 8 ký tự
		form.setFieldsValue({ code: randomCode }); // Gán mã ngẫu nhiên vào input
	};

	return (
		<>
			<div className="flex items-center justify-between mb-5">
				<h1 className="font-semibold text-2xl">Sửa voucher</h1>
				<Button
					className="ml-[504px]"
					onClick={generateRandomCode}
				>
					Tạo mã ngẫu nhiên
				</Button>
				
					<Link to="/admin/voucher">
					<Button type="primary">
						<BackwardFilled /> Quay lại
					
				</Button>
				</Link>
			</div>
			<div className="w-full mx-auto overflow-y-auto max-h-[400px]">
				{contextHolder}
				<Form
					form={form}
					name="voucherForm"
					labelCol={{ span: 8 }}
					wrapperCol={{ span: 16 }}
					style={{ maxWidth: 600 }}
					onFinish={onFinish}
					autoComplete="off"
				>
					{/* Tên voucher */}
					<Form.Item<Voucher>
						label="Tên voucher"
						name="name"
						rules={[{ required: true, message: "Vui lòng nhập tên voucher!" }]}
					>
						<Input
							className="Input-antd text-sm placeholder-gray-400"
							placeholder="Nhập tên voucher"
						/>
					</Form.Item>

					{/* Mã voucher */}
					<Form.Item<Voucher>
						label="Mã voucher"
						name="code"
						rules={[
							{ required: true, message: "Vui lòng nhập mã voucher!" }, // Kiểm tra không để trống
							{ len: 8, message: "Mã voucher phải có chính xác 8 ký tự!" }, // Kiểm tra đúng 8 ký tự
						]}
					>
						<Input
							className="Input-antd text-sm placeholder-gray-400"
							placeholder="Nhập mã voucher"
						/>
					</Form.Item>

					{/* Button để chọn loại */}
					<Form.Item
						label="Áp dụng cho:"
						className="mb-4 "
					>
						<div>
							<Button
								type={selectedType === "category" ? "primary" : "default"}
								onClick={() => handleTypeSelect("category")}
								className="mr-2"
							>
								Áp dụng cho danh mục
							</Button>
							<Button
								type={selectedType === "product" ? "primary" : "default"}
								onClick={() => handleTypeSelect("product")}
							>
								Áp dụng cho sản phẩm
							</Button>
						</div>
					</Form.Item>

					{/* Label và Select cho danh mục */}
					{selectedType === "category" && (
						<Form.Item
							label="Danh mục"
							name="applicableCategories"
							rules={[
								{
									required: true,
									message: "Vui lòng chọn ít nhất một danh mục",
								},
							]}
						>
							<Select
								placeholder="Chọn danh mục"
								loading={isLoadingCategories}
								disabled={isLoadingCategories}
								mode="multiple"
							>
								{categories?.data?.map((category: Category) => (
									<Select.Option
										key={category._id}
										value={category._id}
									>
										{category.title}
									</Select.Option>
								))}
							</Select>
						</Form.Item>
					)}

					{/* Label và Select cho sản phẩm */}
					{selectedType === "product" && (
						<Form.Item
							label="Sản phẩm"
							name="applicableProducts"
							rules={[
								{
									required: true,
									message: "Vui lòng chọn ít nhất một sản phẩm",
								},
							]}
						>
							<Select
								placeholder="Chọn sản phẩm"
								loading={isLoadingProducts}
								disabled={isLoadingProducts}
								mode="multiple"
							>
								{products?.data?.map((product: Product) => (
									<Select.Option
										key={product._id}
										value={product._id}
									>
										{product.name}
									</Select.Option>
								))}
							</Select>
						</Form.Item>
					)}

					{/* Mô tả voucher */}
					<Form.Item
						label="Mô tả voucher"
						name="description"
						className="mt-5"
					>
						<ReactQuill
							theme="snow"
							placeholder="Nhập mô tả voucher"
						/>
					</Form.Item>

					{/* Phần trăm giảm giá */}
					<Form.Item<Voucher>
						label="Phần trăm giảm giá"
						name="discountPercentage"
						rules={[
							{ required: true, message: "Vui lòng nhập phần trăm giảm giá!" },
							{
								validator: (_, value) => {
									if (value < 0) {
										return Promise.reject("Phần trăm giảm giá ít nhất là 0!");
									}
									if (value > 100) {
										return Promise.reject(
											"Phần trăm giảm giá nhiều nhất là 100!",
										);
									}
									return Promise.resolve();
								},
							},
						]}
					>
						<InputNumber
							formatter={value => `${value}`}
							style={{ width: "100%" }}
						/>
					</Form.Item>

					{/* Giảm giá tối đa */}
					<Form.Item<Voucher>
						label="Giảm giá tối đa"
						name="maxDiscount"
						rules={[
							{
								validator: (_, value) => {
									if (value < 0) {
										return Promise.reject("Giảm giá ít nhất là 0!");
									}
									return Promise.resolve();
								},
							},
						]}
					>
						<InputNumber
							formatter={value => `${value}`}
							style={{ width: "100%" }}
						/>
					</Form.Item>

					{/* Ngày áp dụng voucher */}
					<Form.Item
						label="Ngày bắt đầu"
						name="minOrderDate"
						rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
					>
						<DatePicker className="w-full" />
					</Form.Item>

					<Form.Item
						label="Ngày kết thúc"
						name="maxOrderDate"
						rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc" }]}
					>
						<DatePicker className="w-full" />
					</Form.Item>

					{/* Số lượng voucher */}
					<Form.Item<Voucher>
						label="Số lượng"
						name="quantity"
						rules={[
							{ required: true, message: "Vui lòng nhập số lượng voucher!" },
						]}
					>
						<InputNumber
							style={{ width: "100%" }}
							min={1}
						/>
					</Form.Item>

					<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
						<Button
							type="primary"
							htmlType="submit"
							className="w-full"
						>
							Sửa voucher
						</Button>
					</Form.Item>
				</Form>
			</div>
		</>
	);
};

export default VoucherUpdatePage;
