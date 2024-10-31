import { BackwardFilled } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	Button,
	DatePicker,
	Form,
	FormProps,
	Input,
	InputNumber,
	message,
	Select,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import instance from "../../../services/api";
import dayjs from "dayjs";
import { Voucher } from "../../../types/voucher";
import ReactQuill from "react-quill";
import { Category } from "../../../types/category";
import { Product } from "../../../types/product";
import { useState } from "react";

const VoucherAddPage = () => {
	const [messageApi, contextHolder] = message.useMessage();
	const navigate = useNavigate();
	const [form] = Form.useForm();
	const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

	// Mutation để thêm voucher
	const { mutate } = useMutation({
		mutationFn: async (voucher: Voucher) => {
			return await instance.post(`/vouchers`, voucher);
		},
		onSuccess: () => {
			messageApi.success("Thêm voucher thành công");
			form.resetFields(); // Reset form sau khi thêm thành công
			setTimeout(() => {
				navigate("/admin/voucher");
			}, 2000);
		},
		onError(error: any) {
			messageApi.error(`Lỗi: ${error.message}`);
		},
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

	// Xử lý khi submit form
	const onFinish: FormProps<Voucher>["onFinish"] = values => {
		console.log("Success:", values);
		mutate(values);
	};

	// Hàm xử lý chọn loại
	const handleTypeSelect = (type: string) => {
		setSelectedTypes(prev =>
			prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
		);
	};

	return (
		<>
			<div className="flex items-center justify-between mb-5">
				<h1 className="font-semibold text-2xl">Thêm voucher mới</h1>
				<Button type="primary">
					<Link to="/admin/voucher">
						<BackwardFilled /> Quay lại
					</Link>
				</Button>
			</div>
			<div className="max-w-3xl mx-auto">
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
					>
						<Input
							className="Input-antd text-sm placeholder-gray-400"
							placeholder="Nhập mã voucher"
						/>
					</Form.Item>

					{/* Button để chọn loại */}
					<div className="mb-4 ml-[199px]">
						<Button
							type={selectedTypes.includes("category") ? "primary" : "default"}
							onClick={() => handleTypeSelect("category")}
							className="mr-2"
						>
							Chọn danh mục
						</Button>
						<Button
							type={selectedTypes.includes("product") ? "primary" : "default"}
							onClick={() => handleTypeSelect("product")}
						>
							Chọn sản phẩm
						</Button>
					</div>

					{/* Select cho danh mục */}
					{selectedTypes.includes("category") && ( 
						<Form.Item
							label="Danh mục"
							name="applicableCategories" // Thay đổi thành category_ids
							rules={[{ required: true, message: "Vui lòng chọn ít nhất một danh mục" }]}
						>
							<Select
								placeholder="Chọn danh mục"
								loading={isLoadingCategories}
								disabled={isLoadingCategories}
								mode="multiple" // Cho phép chọn nhiều danh mục
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

					{/* Select cho sản phẩm */}
					{selectedTypes.includes("product") && ( 
						<Form.Item
							label="Sản phẩm"
							name="applicableProducts" // Thay đổi thành product_ids
							rules={[{ required: true, message: "Vui lòng chọn ít nhất một sản phẩm" }]}
						>
							<Select
								placeholder="Chọn sản phẩm"
								loading={isLoadingProducts}
								disabled={isLoadingProducts}
								mode="multiple" // Cho phép chọn nhiều sản phẩm
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

					{/* Mô tả */}
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
						rules={[{ required: true, message: "Vui lòng nhập phần trăm giảm giá!" },
						{ 
							validator: (_, value) => {
								if (value < 0) {
									return Promise.reject("Phần trăm giảm giá ít nhất là 0!");
								}
								if (value > 100) {
									return Promise.reject("Phần trăm giảm giá nhiều nhất là 100!");
								}
								return Promise.resolve();
							},
						},]}
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
						rules={[{
							validator: (_, value) => {
								if (value < 0) {
									return Promise.reject("Giảm giá ít nhất là 0!");
								}
								return Promise.resolve();
							},
						},]}
					>
						<InputNumber
							formatter={value => `${value}`}
							style={{ width: "100%" }}
						/>
					</Form.Item>

					{/* Số lượng */}
					<Form.Item<Voucher>
						label="Số lượng"
						name="quantity"
						rules={[{ required: true, message: "Vui lòng nhập số lượng!" },
						{ 
							validator: (_, value) => {
								if (value < 0) {
									return Promise.reject("Số lượng ít nhất là 0!");
								}
								return Promise.resolve();
							},
						},]}
					>
						<InputNumber style={{ width: "100%" }} />
					</Form.Item>

					{/* Ngày bắt đầu */}
					<Form.Item<Voucher>
						label="Ngày bắt đầu"
						name="minOrderDate"
						rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu!" }]}
					>
						<DatePicker
							style={{ width: "100%" }}
							format="DD/MM/YYYY HH:mm"
							showTime={{ format: "HH:mm" }}
							disabledDate={current =>
								current && current < dayjs().startOf("day")
							}
						/>
					</Form.Item>

					{/* Ngày kết thúc */}
					<Form.Item<Voucher>
						label="Ngày kết thúc"
						name="maxOrderDate"
						rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc!" }]}
					>
						<DatePicker
							style={{ width: "100%" }}
							format="DD/MM/YYYY HH:mm"
							showTime={{ format: "HH:mm" }}
							disabledDate={current =>
								current && current < dayjs().startOf("day")
							}
						/>
					</Form.Item>

					{/* Nút thêm voucher */}
					<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
						<Button type="primary" htmlType="submit" className="w-full">
							Thêm voucher
						</Button>
					</Form.Item>
				</Form>
			</div>
		</>
	);
};

export default VoucherAddPage;
