import { Button, Form, FormProps, Input, message, Select, Space } from "antd";
import React from "react";
import instance from "../../../services/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BackwardFilled } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { Category } from "../../../types/category";

type FieldType = {
  title?: string;
  parent_id?: string;
};

const CategoryAddPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Call API
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await instance.get("/categories");
      return response.data.data;
    },
  });

  // Mutation để thêm danh mục
  const { mutate } = useMutation({
    mutationFn: async (category: FieldType) => {
      return await instance.post(`/categories`, category);
    },
    onSuccess: () => {
      messageApi.success("Thêm danh mục thành công");
      // Reset form sau khi thêm thành công
      form.resetFields();
      // Chuyển hướng về trang quản lý danh mục
      setTimeout(() => {
        navigate("/admin/category");
      }, 2000);
    },
    onError(error) {
      // Giả sử error có thông tin về isDeleted, bạn sẽ kiểm tra lỗi này.
      if (error.response?.data?.isDeleted) {
        messageApi.info("Danh mục đã bị xóa mềm và không thể thêm lại.");
      } else {
        messageApi.error(
          "Lỗi: Danh mục này đã bị ẩn hoặc xóa, vui lòng kiểm tra lại trong danh sách đã xóa"
        );
      }
    },
  });

  // Xử lý khi submit form
  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    console.log("Success:", values);
    mutate(values);
  };

  // Lọc danh mục cha (chỉ những danh mục không có parent_id)
  const parentCategories = Array.isArray(categories)
    ? categories.filter((category: Category) => !category.parent_id)
    : [];

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-semibold text-2xl">Thêm danh mục mới</h1>
        <Link to="/admin/category">
          <Button
            className="flex items-center justify-center bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-md transition duration-300 ease-in-out"
            type="primary"
          >
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
        >
          <Form.Item<FieldType>
            label="Tên danh mục"
            required
            name="title"
            rules={[
              {
                min: 3,
                message: "Tên danh mục phải có ít nhất 3 ký tự!",
              },
              {
                validator: async (_, value) => {
                  if (!value) {
                    return Promise.reject(
                      new Error("Vui lòng nhập tên danh mục!")
                    );
                  }

                  const trimmedValue = value.trim();
                  const hasNumber = /\d/;
                  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>[\]\\/_+=-]/;

                  // Kiểm tra không chứa số
                  if (hasNumber.test(trimmedValue)) {
                    return Promise.reject(
                      new Error("Tên danh mục không được chứa số!")
                    );
                  }

                  // Kiểm tra không chứa ký tự đặc biệt
                  if (hasSpecialChar.test(trimmedValue)) {
                    return Promise.reject(
                      new Error("Tên danh mục không được chứa ký tự đặc biệt!")
                    );
                  }

                  // Kiểm tra danh mục đã tồn tại
                  const response = await instance.get(
                    `/categories?title=${trimmedValue}`
                  );
                  const existingCategory = response.data.data.find(
                    (category: Category) =>
                      category.title.toLowerCase() ===
                      trimmedValue.toLowerCase()
                  );
                  if (existingCategory) {
                    return Promise.reject(
                      new Error(
                        "Tên danh mục đã tồn tại. Vui lòng chọn tên khác!"
                      )
                    );
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              className="Input-antd text-sm placeholder-gray-400"
              placeholder="Nhập tên danh mục"
            />
          </Form.Item>

          {/* Select để chọn danh mục cha */}
          <Form.Item<FieldType> label="Danh mục cha" name="parent_id">
            <Select
              loading={isCategoriesLoading}
              placeholder="Chọn danh mục cha (nếu có)"
              allowClear
            >
              {parentCategories?.map((category: Category) => (
                <Select.Option key={category._id} value={category._id}>
                  {category.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Space>
              <Button type="primary" htmlType="submit">
                Thêm danh mục
              </Button>
              <Button
                htmlType="reset"
                className="bg-gray-300 text-gray-800 rounded-md px-4 py-2 hover:bg-gray-400 transition"
              >
                Làm mới
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default CategoryAddPage;
