import { Button, Form, Input, message, Select, Space, Spin } from "antd";
import React, { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(false);
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
      setLoading(false); // Dừng loading khi thành công
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category", id] });

      setTimeout(() => {
        navigate("/admin/category");
      }, 2000);
    },
    onError(error) {
      messageApi.error(`Lỗi: ${error.message}`);
      setLoading(false);
    },
  });

  // Xử lý khi submit form
  const onFinish = (values: FieldType) => {
    if (!Array.isArray(categories)) {
      messageApi.error("Dữ liệu danh mục không hợp lệ!");
      return;
    }

    const isParentCategoryValid = categories.some(
      (category: Category) => category._id === values.parent_id
    );

    const updatedValues = {
      ...values,
      parent_id: isParentCategoryValid ? values.parent_id : null, // Gán null nếu không hợp lệ
    };

    setLoading(true);
    mutate(updatedValues);
  };

  // Xử lý khi có dữ liệu categoryData hoặc categories
  useEffect(() => {
    if (categoryData && Array.isArray(categories)) {
      const isParentCategoryValid = categories.some(
        (category: Category) =>
          category._id === categoryData.category?.parent_id?._id
      );

      form.setFieldsValue({
        title: categoryData.category?.title,
        parent_id: isParentCategoryValid
          ? categoryData.category?.parent_id?._id
          : null,
      });
    }
  }, [categoryData, categories, form]);

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
          <Form.Item
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

                  // Kiểm tra không chứa số
                  if (/\d/.test(trimmedValue)) {
                    return Promise.reject(
                      new Error("Tên danh mục không được chứa số!")
                    );
                  }

                  // Kiểm tra không chứa ký tự đặc biệt
                  if (/[!@#$%^&*(),.?":{}|<>[\]\\/_+=-]/.test(trimmedValue)) {
                    return Promise.reject(
                      new Error("Tên danh mục không được chứa ký tự đặc biệt!")
                    );
                  }

                  // Cho phép giữ nguyên tên danh mục
                  if (categoryData?.category?.title === trimmedValue) {
                    return Promise.resolve(); // Nếu không thay đổi gì thì cho qua
                  }

                  // Kiểm tra danh mục đã tồn tại
                  try {
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
                  } catch (error) {
                    return Promise.reject(
                      new Error("Lỗi kết nối, vui lòng thử lại!")
                    );
                  }
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
          <Form.Item label="Danh mục cha" name="parent_id">
            <Select
              loading={isCategoriesLoading || isCategoryLoading}
              placeholder="Chọn danh mục cha (nếu có)"
              allowClear
              options={parentCategories
                .filter(
                  (category) => category._id !== categoryData?.category?._id
                )
                .map((category) => ({
                  value: category._id,
                  label: category.title,
                }))}
            />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Space>
              <Button type="primary" htmlType="submit">
                Cập nhật danh mục
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

export default CategoryUpdatePage;
