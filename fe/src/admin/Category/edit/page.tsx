import { Button, Form, Input, message, Select, Space, Spin } from "antd";
import React, { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import instance from "../../../services/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { BackwardFilled } from "@ant-design/icons";
import { Category } from "../../../types/category";

type FieldType = {
  title?: string;
  parent_id?: string | null;
};

const CategoryUpdatePage = () => {
  const { id } = useParams(); // Lấy id danh mục từ URL
  const navigate = useNavigate(); // Dùng để chuyển hướng sau khi cập nhật
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: categoryData, isLoading: isCategoryLoading } = useQuery({
    queryKey: ["category", id],
    queryFn: async () => {
      const response = await instance.get(`/categories/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });

  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await instance.get("/categories");
      return response.data.data;
    },
  });

  // Mutation để cập nhật danh mục
  const { mutate } = useMutation({
    mutationFn: async (category: FieldType) => {
      return await instance.put(`/categories/${id}`, category);
    },
    onSuccess: () => {
      messageApi.success("Cập nhật danh mục thành công");

      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category", id] });

      setTimeout(() => {
        navigate("/admin/category");
      }, 2000);
    },
    onError(error) {
      messageApi.error(`Lỗi: ${error.message}`);
    },
  });

  const onFinish = (values: FieldType) => {
    const updatedValues = {
      ...values,
      parent_id: values.parent_id || null,
    };

    mutate(updatedValues);
  };

  useEffect(() => {
    if (categoryData) {
      form.setFieldsValue({
        title: categoryData?.category?.title,
        parent_id: categoryData?.category?.parent_id?._id || null,
      });
    }
  }, [categoryData, form]);

  const parentCategories = Array.isArray(categories)
    ? categories.filter((category: Category) => !category.parent_id)
    : [];
  // Hiển thị loading khi dữ liệu chưa sẵn sàng
  if (isCategoryLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-semibold text-2xl">Cập nhật danh mục</h1>
        <Button
          className="flex items-center justify-center bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-md transition duration-300 ease-in-out"
          type="primary"
        >
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
          <Form.Item
            label="Tên danh mục"
            name="title"
            rules={[
              { required: true, message: "Vui lòng nhập tên danh mục!" },
              { min: 3, message: "Tên danh mục phải có ít nhất 3 ký tự!" },
            ]}
          >
            <Input />
          </Form.Item>

          {/* Select để chọn danh mục cha */}
          <Form.Item label="Danh mục cha" name="parent_id">
            <Select
              loading={isCategoriesLoading || isCategoryLoading}
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
                Cập nhật danh mục
              </Button>{" "}
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

export default CategoryUpdatePage;
