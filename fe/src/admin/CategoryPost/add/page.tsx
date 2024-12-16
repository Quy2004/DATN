import { BackwardFilled, FileImageOutlined } from "@ant-design/icons";
import { Button, Form, Input, message } from "antd";
import Upload from "antd/es/upload/Upload";
import ReactQuill from "react-quill";
import { Link, useNavigate } from "react-router-dom";
import { CategoryPost } from "../../../types/categoryPost";
import axios from "axios";
import { RcFile } from "antd/es/upload";
import { useState } from "react";
import instance from "../../../services/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient(); // Tạo instance của QueryClient

const CategoryPostAddPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [image, setImage] = useState<string>("");

  // Upload Ảnh Cloudinary
  const uploadImage = async (file: RcFile, isMainImage: boolean) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "duan_totnghiep");

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/duantotnghiep/image/upload",
        formData
      );
      if (isMainImage) {
        setImage(res.data.secure_url);
      }
      message.success("Ảnh đã được upload thành công!");
    } catch (error) {
      message.error("Upload ảnh thất bại!");
    }
  };

  const uploadMainImage = (file: RcFile) => {
    uploadImage(file, true);
    return false;
  };

  const handleRemoveImage = () => {
    setImage("");
    message.info("Ảnh  đã được xóa. Vui lòng upload ảnh mới.");
  };

  const onFinish = async (values: CategoryPost) => {
    const productData = {
      ...values,
      // thumbnail: image,
      // description: values.description,
    };

    try {
      await instance.post("/categoryPost", productData); // Gửi dữ liệu tới server
      messageApi.success("Thêm sản phẩm thành công!");

      setTimeout(() => {
        navigate(`/admin/categoryPost`); // Điều hướng về trang danh sách
      }, 2000);
      form.resetFields();
    } catch (error) {
      messageApi.error("Thêm sản phẩm thất bại!");
      console.error(error);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <>
        <div className="flex items-center justify-between mb-5">
          <h1 className="font-semibold text-2xl">Thêm post mới</h1>
          <Button type="primary">
            <Link to="/admin/categoryPost">
              <BackwardFilled /> Quay lại
            </Link>
          </Button>
        </div>
        <div className="max-w-3xl mx-auto overflow-y-auto max-h-[400px]">
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
            <Form.Item<CategoryPost>
              label="Tên danh mục"
              required
              name="title"
              rules={[
                {
                  validator: async (_, value) => {
                    if (!value) {
                      return Promise.reject(
                        new Error("Vui lòng nhập tên danh mục!")
                      );
                    }
                    const trimmedValue = value.trim();
                    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>[\]\\/_+=-]/;

                    if (hasSpecialChar.test(trimmedValue)) {
                      return Promise.reject(
                        new Error(
                          "Tên danh mục không được chứa ký tự đặc biệt!"
                        )
                      );
                    }
                    // Kiểm tra danh mục đã tồn tại
                    const response = await instance.get(
                      `/categoryPost?title=${trimmedValue}`
                    );
                    const existingCategory = response.data.data.find(
                      (category: CategoryPost) =>
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

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit">
                Thêm mới
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
    </QueryClientProvider>
  );
};

export default CategoryPostAddPage;
