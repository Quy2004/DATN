import { BackwardFilled } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Form, FormProps, Input, message, Select } from "antd";
import { Link, useNavigate } from "react-router-dom";
import instance from "../../../services/api";
import { Category } from "../../../types/category";

type FieldType = {
  nameTopping: string;
  priceTopping?: number;
  statusTopping: string;
};

const ToppingAddPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Mutation để thêm topping
  const { mutate } = useMutation({
    mutationFn: async (topping: FieldType) => {
      return await instance.post(`/toppings`, topping);
    },
    onSuccess: () => {
      messageApi.success("Thêm Topping thành công");
      // Reset form sau khi thêm thành công
      form.resetFields();

      setTimeout(() => {
        navigate("/admin/topping");
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
  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    console.log("Success:", values);
    mutate(values);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-semibold text-2xl">Thêm Topping mới</h1>
        <Link to="/admin/topping">
          <Button type="primary">
            <BackwardFilled /> Quay lại
          </Button>
        </Link>
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
          initialValues={{
            statusTopping: "available",
          }}
        >
          <Form.Item<FieldType>
            label="Tên Topping"
            name="nameTopping"
            rules={[
              { required: true, message: "Vui lòng nhập tên Topping!" },
              { whitespace: true, message: "Tên Topping không được để trống!" },
              { min: 2, message: "Tên Topping phải có ít nhất 2 ký tự!" },
              { max: 50, message: "Tên Topping không được quá 50 ký tự!" },
            ]}
          >
            <Input
              className="Input-antd text-sm placeholder-gray-400"
              placeholder="Nhập tên topping"
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
                <Select.Option key={category._id} value={category._id}>
                  {category.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item<FieldType>
            label="Giá Topping"
            name="priceTopping"
            rules={[
              {
                validator: (_, value) => {
                  if (!value) {
                    return Promise.reject(
                      new Error("Vui lòng nhập giá Topping!")
                    );
                  }
                  if (value <= 0) {
                    return Promise.reject(new Error("Giá phải lớn hơn 0!"));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              type="number"
              className="Input-antd text-sm placeholder-gray-400"
              placeholder="Nhập giá topping"
            />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Thêm Topping
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default ToppingAddPage;
