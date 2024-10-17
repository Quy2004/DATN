import React, { useState } from "react";
import { Form, Input, Button, Select, InputNumber, Space, message } from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import instance from "../../../services/api";
import Title from "antd/es/typography/Title";
import { Link, useNavigate } from "react-router-dom";
import { DoubleLeftOutlined, FileImageOutlined } from "@ant-design/icons";

import {
  ProductFormValues,
  ProductSize,
  ProductTopping,
  Size,
  Topping,
} from "../../../types/product";
import { Category } from "../../../types/category";
import Upload, { RcFile } from "antd/es/upload";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import CSS cho React Quill
const { Option } = Select;

const ProductAddPage: React.FC = () => {
  const [, contextHolder] = message.useMessage();
  const [image, setImage] = useState<string>("");
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [description, setDescription] = useState<string>("");
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await instance.get(`/categories`);
      return response.data;
    },
  });

  const { data: sizes, isLoading: isLoadingSizes } = useQuery({
    queryKey: ["sizes"],
    queryFn: async () => {
      const response = await instance.get(`/sizes`);
      return response.data;
    },
  });

  const { data: toppings, isLoading: isLoadingToppings } = useQuery({
    queryKey: ["toppings"],
    queryFn: async () => {
      const response = await instance.get(`/toppings`);
      return response.data;
    },
  });

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
      } else {
        setThumbnails((prev) => [...prev, res.data.secure_url]);
      }
      message.success("Ảnh đã được upload thành công!");
    } catch (error) {
      message.error("Upload ảnh thất bại!");
    }
  };

  const onFinish = async (values: ProductFormValues) => {
    if (!image) {
      return message.error("Vui lòng upload ảnh chính.");
    }

    const productData = {
      ...values,

      category_id: values.category_id,
      image: image,
      thumbnail: thumbnails,
      price: values.price,
      product_sizes: values.product_sizes.map((size: ProductSize) => ({
        size_id: size.size_id,
        status: size.status,
      })),
      product_toppings: values.product_toppings.map(
        (topping: ProductTopping) => ({
          topping_id: topping.topping_id,
        })
      ),
      description: values.description,
      stock: values.stock,
      discount: values.discount,
      status: values.status,
    };

    try {
      await instance.post("/products", productData);
      message.success("Thêm sản phẩm thành công!");
      setTimeout(() => {
        navigate(`/admin/product`);
      }, 2000);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (error) {
      message.error("Thêm sản phẩm thất bại!");
      console.error(error);
    }
  };

  const uploadMainImage = (file: RcFile) => {
    uploadImage(file, true);
    return false;
  };

  const uploadThumbnails = (file: RcFile) => {
    uploadImage(file, false);
    return false;
  };

  return (
    <div>
      {contextHolder}
      <div className="flex items-center justify-between mb-5">
        <Title level={3}>Thêm mới sản phẩm</Title>
        <Button type="primary" icon={<DoubleLeftOutlined />}>
          <Link to="/admin/product" style={{ color: "white" }}>
            Quay lại
          </Link>
        </Button>
      </div>
      <div className="max-w-3xl mx-auto">
        <Form
          form={form}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          onFinish={onFinish}
          initialValues={{
            status: "available",
            product_sizes: [],
            product_toppings: [],
          }}
        >
          {/* Tên sản phẩm */}
          <Form.Item
            label="Tên sản phẩm"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
          >
            <Input placeholder="Nhập tên sản phẩm" />
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
          <Form.Item
            label="Giá sản phẩm"
            name="price"
            rules={[{ required: true, message: "Vui lòng nhập giá sản phẩm" }]}
          >
            <Input placeholder="Nhập giá sản phẩm" />
          </Form.Item>
          {/* Upload Ảnh Chính */}
          <Form.Item label="Upload ảnh chính">
            <Upload
              name="file"
              listType="picture-card"
              beforeUpload={uploadMainImage}
              maxCount={1}
            >
              <Button icon={<FileImageOutlined />}></Button>
            </Upload>
          </Form.Item>

          {/* Upload Ảnh Phụ */}
          <Form.Item label="Upload ảnh phụ">
            <Upload
              name="files"
              listType="picture-card"
              multiple
              beforeUpload={uploadThumbnails}
              maxCount={4}
            >
              <Button icon={<FileImageOutlined />}></Button>
            </Upload>
          </Form.Item>

          <div className="flex flex-col items-center">
            <Form.List name="product_sizes">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <div
                      key={field.key}
                      className="flex items-center space-x-4 mb-4 w-full"
                    >
                      <Form.Item
                        name={[field.name, "size_id"]}
                        label="Size"
                        rules={[{ required: true, message: "Chọn size" }]}
                        className="flex-1 mb-0"
                      >
                        <Select
                          placeholder="Chọn size"
                          loading={isLoadingSizes}
                          disabled={isLoadingSizes}
                          className="w-full"
                        >
                          {sizes?.data.map((size: Size) => (
                            <Option key={size._id} value={size._id}>
                              {size.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        name={[field.name, "status"]}
                        label="Trạng thái"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn trạng thái",
                          },
                        ]}
                        className="flex-1 mb-0"
                      >
                        <Select
                          placeholder="Chọn trạng thái"
                          className="w-full"
                        >
                          <Option value="available">Có sẵn</Option>
                          <Option value="unavailable">Hết hàng</Option>
                        </Select>
                      </Form.Item>

                      <Button
                        onClick={() => remove(field.name)}
                        danger
                        className="text-red-500 mb-0"
                      >
                        Xóa
                      </Button>
                    </div>
                  ))}

                  {/* Add Button */}
                  <Button
                    className="mt-2 bg-blue-500 text-white"
                    onClick={() => add()}
                  >
                    Thêm kích thước
                  </Button>
                </>
              )}
            </Form.List>

            {/* Topping sản phẩm */}
            <Form.List name="product_toppings">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <div
                      key={field.key}
                      className="flex items-center space-x-4 mb-4 w-full max-w-3xl mt-6"
                    >
                      {/* Topping Selection */}
                      <Form.Item
                        name={[field.name, "topping_id"]}
                        label="Topping"
                        rules={[{ required: true, message: "Chọn topping" }]}
                        className="flex-1 mb-0"
                      >
                        <Select
                          placeholder="Chọn topping"
                          loading={isLoadingToppings}
                          disabled={isLoadingToppings}
                          className="w-full"
                        >
                          {toppings?.data.map((topping: Topping) => (
                            <Option key={topping._id} value={topping._id}>
                              {topping.nameTopping}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      {/* Remove Button */}
                      <Button
                        onClick={() => remove(field.name)}
                        danger
                        className="text-red-500 mb-0"
                      >
                        Xóa
                      </Button>
                    </div>
                  ))}

                  {/* Add Button */}
                  <Button
                    className="mt-5 bg-green-500 text-white mx-3"
                    onClick={() => add()}
                  >
                    Thêm topping
                  </Button>
                </>
              )}
            </Form.List>
          </div>
          <Form.Item
            label="Mô tả sản phẩm"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
            className="mt-5"
          >
            <ReactQuill
              theme="snow"
              value={description}
              onChange={setDescription}
              placeholder="Nhập mô tả sản phẩm"
            />
          </Form.Item>

          <Form.Item
            className="mt-5"
            label="Tồn kho"
            name="stock"
            rules={[{ required: true, message: "Vui lòng nhập tồn kho" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              placeholder="Nhập tồn kho"
            />
          </Form.Item>

          <Form.Item
            label="Giảm giá (Tính theo %)"
            name="discount"
            rules={[{ required: true, message: "Vui lòng nhập giảm giá" }]}
          >
            <Input placeholder="Nhập giảm giá" />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="available">Có sẵn</Option>
              <Option value="unavailable">Hết hàng</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <div className="flex justify-center mx-80">
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition"
                >
                  Thêm sản phẩm
                </Button>
                <Button
                  htmlType="reset"
                  className="bg-gray-300 text-gray-800 rounded-md px-4 py-2 hover:bg-gray-400 transition"
                >
                  Làm mới
                </Button>
              </Space>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ProductAddPage;
