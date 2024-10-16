import { Button, Form, FormProps, Input, message, Select } from "antd";
import React from "react";
import instance from "../../../services/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BackwardFilled } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

type FieldType = {
  title?: string;
  parent_id?: string;
};

const CategoryAddPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Fetch danh mục cha (nếu có)
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await instance.get("/categories");
      return response.data.data;
    },
  });

  // Mutation để thêm danh mục
  const { mutate, isLoading: isMutating } = useMutation({
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
    onError(error: any) {
      messageApi.error(`Lỗi: ${error.message}`);
    },
  });

  // Xử lý khi submit form
  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    console.log("Success:", values);
    mutate(values);
  };

  // Lọc danh mục cha (chỉ những danh mục không có parent_id)
  const parentCategories = Array.isArray(categories)
    ? categories.filter((category: any) => !category.parent_id)
    : [];

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-semibold text-2xl">Thêm danh mục mới</h1>
        <Button type="primary">
          <Link to="/admin/category">
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
          <Form.Item<FieldType>
            label="Tên danh mục"
            name="title"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục!" }]}
          >
            <Input />
          </Form.Item>

          {/* Select để chọn danh mục cha */}
          <Form.Item<FieldType> label="Danh mục cha" name="parent_id">
            <Select
              loading={isCategoriesLoading}
              placeholder="Chọn danh mục cha (nếu có)"
              allowClear
            >
              {parentCategories?.map((category: any) => (
                <Select.Option key={category._id} value={category._id}>
                  {category.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit" loading={isMutating}>
              Thêm danh mục
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default CategoryAddPage;
