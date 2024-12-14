import { BackwardFilled } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Form, FormProps, Input, message, Select } from "antd";
import { Link, useNavigate } from "react-router-dom";
import instance from "../../../services/api";
import { Category } from "../../../types/category";
import { Topping } from "../../../types/topping";

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
      <div className="max-w-3xl mx-auto max-h-[450px] overflow-y-auto">
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
            required
            rules={[
              { whitespace: true, message: "Tên Topping không được để trống!" },
              { min: 2, message: "Tên Topping phải có ít nhất 2 ký tự!" },
              { max: 50, message: "Tên Topping không được quá 50 ký tự!" },
              {
                validator: async (_, value) => {
                  if (!value) {
                    return Promise.reject(
                      new Error("Vui lòng nhập tên Topping!")
                    );
                  }
                  const trimmedValue = value.trim();
                  const hasNumber = /\d/;
                  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>[\]\\/_+=-]/;

                  // Kiểm tra số và ký tự đặc biệt
                  if (hasNumber.test(trimmedValue)) {
                    return Promise.reject(
                      new Error("Tên Topping không được chứa số!")
                    );
                  }

                  if (hasSpecialChar.test(trimmedValue)) {
                    return Promise.reject(
                      new Error("Tên Topping không được chứa ký tự đặc biệt!")
                    );
                  }

                  return Promise.resolve();
                },
              },
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
              mode="multiple"
              style={{ width: "100%" }}
              placeholder="Chọn danh mục"
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
            required
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
                  if (value > 20000) {
                    return Promise.reject(
                      new Error("Giá topping không được vượt quá 20.000!")
                    );
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

export default ToppingAddPage;
