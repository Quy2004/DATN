import { BackwardFilled } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Spin
} from "antd";
import dayjs from "dayjs";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import instance from "../../../services/api";
import { Voucher } from "../../../types/voucher";



const VoucherUpdatePage = () => {
	const { id } = useParams(); // Lấy id voucher từ URL
	const navigate = useNavigate(); // Dùng để chuyển hướng sau khi cập nhật
	const [messageApi, contextHolder] = message.useMessage();
	const [form] = Form.useForm();
	const queryClient = useQueryClient();

  // Truy vấn để lấy dữ liệu voucher hiện tại
  const { data: voucherData, isLoading: isvoucherLoading } = useQuery({
    queryKey: ["voucher", id],
    queryFn: async () => {
      const response = await instance.get(`/vouchers/${id}`); // Lấy thông tin voucher từ API
      return response.data.data;
    },
    enabled: !!id, // Chỉ chạy truy vấn nếu có id
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
      });
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
          name="basic"
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
						<Input />
					</Form.Item>

					{/* Mã voucher */}
					<Form.Item<Voucher>
						label="Mã voucher"
						name="code"
					>
						<Input />
					</Form.Item>

					{/* Mô tả */}
					<Form.Item<Voucher>
						label="Mô tả"
						name="description"
					>
						<Input.TextArea />
					</Form.Item>

					{/* Phần trăm giảm giá */}
					<Form.Item<Voucher>
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

					{/* Số lượng */}
					<Form.Item<Voucher>
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

export default VoucherUpdatePage;
