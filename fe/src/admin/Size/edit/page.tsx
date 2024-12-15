import { BackwardFilled } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, InputNumber, message, Select, Spin } from "antd";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import instance from "../../../services/api";
import { Category } from "../../../types/category";
import { Size } from "../../../types/size";

const { Option } = Select;

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
    mutationFn: async (size: Size) => {
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
  const onFinish = (values: Size) => {
    mutate(values);
  };
  const subcategories = categories?.data?.filter(
    (category: Category) => category.parent_id !== null
  );
  // Hiển thị loading khi dữ liệu chưa sẵn sàng
  if (isSizeLoading || isLoadingCategories) {
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
              {subcategories?.map((subcategory: Category) => (
                <Select.Option key={subcategory._id} value={subcategory._id}>
                  {subcategory.title}
                </Select.Option>
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
              Cập nhật size
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

export default SizeUpdatePage;
