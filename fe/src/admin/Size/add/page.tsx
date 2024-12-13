import { BackwardFilled } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Form,
  FormProps,
  Input,
  InputNumber,
  message,
  Select,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import instance from "../../../services/api";
import { Category } from "../../../types/category";
import { Size } from "../../../types/size";
const { Option } = Select;

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
            rules={[
              { required: true, message: "Vui lòng nhập tên size!" },
              {
                validator: async (_, value) => {
                  const hasNumber = /\d/;
                  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>[\]\\/_+=-]/;

                  // Kiểm tra số và ký tự đặc biệt
                  if (hasNumber.test(value)) {
                    return Promise.reject(
                      new Error("Tên Size không được chứa số!")
                    );
                  }

                  if (hasSpecialChar.test(value)) {
                    return Promise.reject(
                      new Error("Tên Size không được chứa ký tự đặc biệt!")
                    );
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              className="Input-antd text-sm placeholder-gray-400"
              placeholder="Nhập tên size"
            />
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
            label="Giá tiền"
            name="priceSize"
            rules={[
              { required: true, message: "Vui lòng nhập giá của Size!" },
              {
                validator: (_, value) => {
                  if (value < 0) {
                    return Promise.reject("Giá Size ít nhất là 0!");
                  }
                  if (value > 20000) {
                    return Promise.reject(
                      new Error("Giá Size không được vượt quá 20.000!")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              className="Input-antd text-sm placeholder-gray-400"
              placeholder="Nhập giá size"
            />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Thêm size
            </Button>
            <Button
              htmlType="reset"
              className="bg-gray-300 text-gray-800 rounded-md px-4 py-2 hover:bg-gray-400 transition ml-2"
            >
              Làm mới
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default SizeAddPage;
