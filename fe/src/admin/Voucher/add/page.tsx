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

type FieldType = {
	name: string;
	code?: string;
	description?: string;
	discountPercentage: number;
	maxDiscount: number;
	quantity: number;
	minOrderDate: Date;
	maxOrderDate: Date;
};

const VoucherAddPage = () => {
	const [messageApi, contextHolder] = message.useMessage();
	const navigate = useNavigate();
	const [form] = Form.useForm();

	// Mutation để thêm voucher
	const { mutate } = useMutation({
		mutationFn: async (voucher: FieldType) => {
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
	const onFinish: FormProps<FieldType>["onFinish"] = values => {
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
					<Form.Item<FieldType>
						label="Tên voucher"
						name="name"
						rules={[{ required: true, message: "Vui lòng nhập tên voucher!" }]}
					>
						<Input />
					</Form.Item>

					{/* Mã voucher */}
					<Form.Item<FieldType>
						label="Mã voucher"
						name="code"
					>
						<Input />
					</Form.Item>

					{/* Mô tả */}
					<Form.Item<FieldType>
						label="Mô tả"
						name="description"
					>
						<Input.TextArea />
					</Form.Item>

					{/* Phần trăm giảm giá */}
					<Form.Item<FieldType>
						label="Phần trăm giảm giá"
						name="discountPercentage"
						rules={[
							{ required: true, message: "Vui lòng nhập phần trăm giảm giá!" },
						]}
					>
						<InputNumber
							min={0}
							max={100}
							formatter={value => `${value}`}
							style={{ width: "100%" }}
						/>
					</Form.Item>

					{/* Giảm giá tối đa */}
					<Form.Item<FieldType>
						label="Giảm giá tối đa"
						name="maxDiscount"
						rules={[
							{ required: true, message: "Vui lòng nhập giảm giá tối đa!" },
						]}
					>
						<InputNumber
							min={0}
							formatter={value => `${value}`}
							style={{ width: "100%" }}
						/>
					</Form.Item>

					{/* Số lượng */}
					<Form.Item<FieldType>
						label="Số lượng"
						name="quantity"
						rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
					>
						<InputNumber
							min={0}
							style={{ width: "100%" }}
						/>
					</Form.Item>

					{/* Ngày bắt đầu */}
					<Form.Item<FieldType>
						label="Ngày bắt đầu"
						name="minOrderDate"
						rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu!" }]}
					>
						<DatePicker
							style={{ width: "100%" }}
							format="DD/MM/YYYY"
							disabledDate={current =>
								current && current < dayjs().startOf("day")
							}
						/>
					</Form.Item>

					{/* Ngày kết thúc */}
					<Form.Item<FieldType>
						label="Ngày kết thúc"
						name="maxOrderDate"
						rules={[
							{ required: true, message: "Vui lòng chọn ngày kết thúc!" },
						]}
					>
						<DatePicker
							style={{ width: "100%" }}
							format="DD/MM/YYYY"
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
