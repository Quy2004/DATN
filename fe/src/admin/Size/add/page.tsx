import { BackwardFilled } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Form, FormProps, Input, message, Select } from "antd";
import { Link, useNavigate } from "react-router-dom";
import instance from "../../../services/api";
import { Category } from "../../../types/category";
import { Size } from "../../../types/product";


const { Option } = Select; // Nhập Option từ Select
const SizeAddPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Mutation để thêm size
  const { mutate } = useMutation({
    mutationFn: async (size: Size) => {
      return await instance.post(`/sizes`, size);
    },
    onSuccess: () => {
      messageApi.success("Thêm size thành công");
      // Reset form sau khi thêm thành công
      form.resetFields();
      // Chuyển hướng về trang quản lý size
      setTimeout(() => {
        navigate("/admin/size");
      }, 2000);
    },
    onError(error) {
      messageApi.error(`Lỗi: ${error.message}`);
    },
  });

  // kết nối đền bảng category
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await instance.get(`/categories`);
      return response.data;
    },
  });

  // Xử lý khi submit form
  const onFinish: FormProps<Size>["onFinish"] = (values) => {
    console.log("Success:", values);
    mutate(values);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-semibold text-2xl">Thêm size mới</h1>
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
          <Form.Item<Size>
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
                <Option key={category._id} value={category._id}>
                  {category.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item<Size>
            label="Giá"
            name="priceSize"
            rules={[{ required: true, message: "Vui lòng nhập giá size!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Thêm size
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default SizeAddPage;
