import { BackwardFilled } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, message, Spin } from "antd";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import instance from "../../../services/api";

type FieldType = {
  name?: string; // Chỉ có trường name
};

const SizeUpdatePage = () => {
  const { id } = useParams(); // Lấy id size từ URL
  const navigate = useNavigate(); // Dùng để chuyển hướng sau khi cập nhật
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Truy vấn để lấy dữ liệu size hiện tại
  const { data: sizeData, isLoading: isSizeLoading } = useQuery({
    queryKey: ["size", id],
    queryFn: async () => {
      const response = await instance.get(`/sizes/${id}`); // Lấy thông tin size từ API
      return response.data.data;
    },
    enabled: !!id, // Chỉ chạy truy vấn nếu có id
  });

  useEffect(() => {
    if (sizeData) {
      form.setFieldsValue({
        name: sizeData.name,
        priceSize: sizeData.priceSize,
      }); // Gán giá trị name vào form
    }
  }, [sizeData, form]);

  // Mutation để cập nhật size
  const { mutate } = useMutation({
    mutationFn: async (size: FieldType) => {
      return await instance.put(`/sizes/${id}`, size); // Gửi yêu cầu cập nhật size
    },
    onSuccess: () => {
      messageApi.success("Cập nhật size thành công");
      queryClient.invalidateQueries({ queryKey: ["size", id] }); // Làm mới truy vấn size
      // Chuyển hướng về trang quản lý size
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
    mutate(values); // Gọi mutation để cập nhật size
  };

  // Hiển thị loading khi dữ liệu chưa sẵn sàng
  if (isSizeLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
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
          <Form.Item
            label="Tên size"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên size!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Giá size"
            name="priceSize"
            rules={[{ required: true, message: "Vui lòng nhập giá size!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Cập nhật size
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default SizeUpdatePage;
