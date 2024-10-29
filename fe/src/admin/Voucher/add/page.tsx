import { BackwardFilled } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import {
	Button,
	DatePicker,
	Form,
	FormProps,
	Input,
	InputNumber,
	message,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import instance from "../../../services/api";
import dayjs from "dayjs";
import { Voucher } from "../../../types/voucher";
import ReactQuill from "react-quill";

const VoucherAddPage = () => {
	const [messageApi, contextHolder] = message.useMessage();
	const navigate = useNavigate();
	const [form] = Form.useForm();

	// Mutation để thêm voucher
	const { mutate } = useMutation({
		mutationFn: async (voucher: Voucher) => {
			return await instance.post(`/vouchers`, voucher);
		},
		onSuccess: () => {
			messageApi.success("Thêm voucher thành công");
			// Reset form sau khi thêm thành công
			form.resetFields();
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
	const onFinish: FormProps<Voucher>["onFinish"] = values => {
		console.log("Success:", values);
		mutate(values);
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
							Thêm voucher
						</Button>
					</Form.Item>
				</Form>
			</div>
		</>
	);
};

export default VoucherAddPage;
