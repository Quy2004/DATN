import { BackwardFilled } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, InputNumber, message, Select, Spin } from "antd";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import instance from "../../../services/api";
import { Category } from "../../../types/category";

const { Option } = Select;

type FieldType = {
	name?: string;
	priceSize: number; // Đảm bảo trường này là bắt buộc
	category_id?: string;
};

const SizeUpdatePage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [messageApi, contextHolder] = message.useMessage();
	const [form] = Form.useForm();
	const queryClient = useQueryClient();

	// Truy vấn để lấy dữ liệu size hiện tại
	const { data: sizeData, isLoading: isSizeLoading } = useQuery({
		queryKey: ["size", id],
		queryFn: async () => {
			const response = await instance.get(`/sizes/${id}`);
			return response.data.data;
		},
		enabled: !!id,
	});

	// Kết nối đến bảng category
	const { data: categories, isLoading: isLoadingCategories } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			const response = await instance.get(`/categories`);
			return response.data;
		},
	});

	useEffect(() => {
		if (sizeData) {
			form.setFieldsValue({
				name: sizeData.name,
				priceSize: sizeData.priceSize, // Gán giá trị priceSize vào form
				category_id: sizeData.category_id,
			});
		}
	}, [sizeData, form]);

	// Mutation để cập nhật size
	const { mutate } = useMutation({
		mutationFn: async (size: FieldType) => {
			return await instance.put(`/sizes/${id}`, size);
		},
		onSuccess: () => {
			messageApi.success("Cập nhật size thành công");
			queryClient.invalidateQueries({ queryKey: ["size", id] });
			setTimeout(() => {
				navigate("/admin/size");
			}, 2000);
		},
		onError(error) {
			messageApi.error(`Lỗi: ${error.message}`);
		},
	});

	// Xử lý khi submit form
	const onFinish = (values: FieldType) => {
		mutate(values);
	};

	// Hiển thị loading khi dữ liệu chưa sẵn sàng
	if (isSizeLoading || isLoadingCategories) {
		return (
			<div style={{ textAlign: "center", padding: "50px" }}>
				<Spin
					size="large"
					tip="Đang tải dữ liệu..."
				/>
			</div>
		);
	}

	return (
		<>
			<div className="flex items-center justify-between mb-5">
				<h1 className="font-semibold text-2xl">Cập nhật size</h1>
				<Button type="primary">
					<Link to="/admin/size">
						<BackwardFilled /> Quay lại
					</Link>
				</Button>
			</div>
			<div className="max-w-3xl mx-auto">
				{contextHolder}
				<Form
					form={form}
					name="basic"
					labelCol={{ span: 8 }}
					wrapperCol={{ span: 16 }}
					style={{ maxWidth: 600 }}
					onFinish={onFinish}
					autoComplete="off"
				>
					<Form.Item<FieldType>
						label="Tên size"
						name="name"
						rules={[{ required: true, message: "Vui lòng nhập tên size!" }]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						label="Danh mục"
						name="category_id"
						rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
					>
						<Select
							placeholder="Chọn danh mục"
							loading={isLoadingCategories}
							disabled={isLoadingCategories}
						>
							{categories?.data?.map((category: Category) => (
								<Option
									key={category._id}
									value={category._id}
								>
									{category.title}
								</Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item<FieldType>
						label="Giá tiền"
						name="priceSize"
						rules={[{ required: true, message: "Vui lòng giá của size!" }]}
					>
						<InputNumber
							min={0}
							style={{ width: "100%" }}
						/>
					</Form.Item>

					<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
						<Button
							type="primary"
							htmlType="submit"
						>
							Cập nhật size
						</Button>
					</Form.Item>
				</Form>
			</div>
		</>
	);
};

export default SizeUpdatePage;
