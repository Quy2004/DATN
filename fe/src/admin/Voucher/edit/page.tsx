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
  Spin
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
	const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

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
		applicableProducts: voucherData.applicableProducts
      });

      // Kiểm tra xem có categories và products không để tự động chọn loại
      if (voucherData.applicableCategories.length > 0) {
        setSelectedTypes(prev => [...new Set([...prev, "category"])]);
      }
      if (voucherData.applicableProducts.length > 0) {
        setSelectedTypes(prev => [...new Set([...prev, "product"])]);
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
							placeholder="Nhập tên voucher"
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
							{ required: true, message: "Vui lòng nhập giảm giá tối đa!" },
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

					{/* Số lượng */}
					<Form.Item<Voucher>
						label="Số lượng"
						name="quantity"
						rules={[
							{ required: true, message: "Vui lòng nhập số lượng!" },
							{
								validator: (_, value) => {
									if (value < 0) {
										return Promise.reject("Số lượng ít nhất là 0!");
									}
									return Promise.resolve();
								},
							},

						]}
					>
						<InputNumber
							style={{ width: "100%" }}
						/>
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
							showTime={{ format: "HH:mm" }} // Hiển thị picker cho giờ và phút
							disabledDate={current =>
								current && current < dayjs().startOf("day")
							}
						/>
					</Form.Item>

					{/* Ngày kết thúc */}
					<Form.Item<Voucher>
						label="Ngày kết thúc"
						name="maxOrderDate"
						rules={[
							{ required: true, message: "Vui lòng chọn ngày kết thúc!" },
						]}
					>
						<DatePicker
							style={{ width: "100%" }}
							format="DD/MM/YYYY HH:mm"
							showTime={{ format: "HH:mm" }} // Hiển thị picker cho giờ và phút
							disabledDate={current =>
								current && current < dayjs().startOf("day")
							}
						/>
					</Form.Item>

					{/* Nút Submit */}
					<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
						<Button
							type="primary"
							htmlType="submit"
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
