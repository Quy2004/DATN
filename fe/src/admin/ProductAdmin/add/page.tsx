import React, { useState } from "react";
import { Form, Input, Button, Select, Space, message } from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import instance from "../../../services/api";
import Title from "antd/es/typography/Title";
import { Link, useNavigate } from "react-router-dom";
import { DoubleLeftOutlined, FileImageOutlined } from "@ant-design/icons";

import {
  ProductFormValues,
  ProductSize,
  ProductTopping,
} from "../../../types/product";
import { Category } from "../../../types/category";
import Upload, { RcFile } from "antd/es/upload";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import CSS cho React Quill
import { Size } from "../../../types/size";
import { Topping } from "../../../types/topping";
const { Option } = Select;

const ProductAddPage: React.FC = () => {
  const [, contextHolder] = message.useMessage();
  const [image, setImage] = useState<string>("");
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );

  const navigate = useNavigate();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await instance.get(`/categories`);
      console.log(response.data);
      return response.data;
    },
  });

  const { data: sizes, isLoading: isLoadingSizes } = useQuery({
    queryKey: ["sizes", selectedCategoryId],
    queryFn: async () => {
      if (!selectedCategoryId) return [];
      const response = await instance.get(
        `/sizes?category=${selectedCategoryId}`
      );
      return response.data;
    },
    enabled: !!selectedCategoryId,
  });

  const { data: toppings, isLoading: isLoadingToppings } = useQuery({
    queryKey: ["toppings", selectedCategoryId],
    queryFn: async () => {
      if (!selectedCategoryId) return [];
      const response = await instance.get(
        `/toppings?category=${selectedCategoryId}`
      );
      return response.data;
    },
    enabled: !!selectedCategoryId,
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
    } catch (error) {
      message.error("Upload ảnh thất bại!");
    }
  };

  const onFinish = async (values: ProductFormValues) => {
    // Kiểm tra ảnh chính
    if (!image) {
      message.error("Vui lòng upload ảnh chính.");
      return;
    }

    const selectedSizes = values.size_id || [];
    if (selectedSizes.length === 0) {
      message.error("Vui lòng chọn ít nhất một size.");
      return;
    }
    const selectedToppings = values.topping_id || [];

    const price = Number(values.price);
    if (!price || price <= 0) {
      message.error("Giá sản phẩm phải lớn hơn 0.");
      return;
    }

    // Kiểm tra danh mục
    if (!values.category_id) {
      message.error("Vui lòng chọn danh mục sản phẩm.");
      return;
    }

    const productSizes = selectedSizes.map((sizeId: ProductSize) => ({
      size_id: sizeId,
      status: "available",
    }));

    const productToppings = selectedToppings.map(
      (toppingId: ProductTopping) => ({
        topping_id: toppingId,
      })
    );
    const productData = {
      name: values.name,
      category_id: values.category_id,
      image: image,
      thumbnail: thumbnails || [],
      price: price,
      product_sizes: productSizes,
      product_toppings: productToppings,
      description: values.description || "",
      discount: Number(values.discount) || 0,
      status: values.status || "available",
    };

    try {
      await instance.post("/products", productData);
      message.success("Thêm sản phẩm thành công!");
      setTimeout(() => {
        navigate(`/admin/product`);
      }, 2000);
      form.resetFields();
      setImage("");
      setThumbnails([]);
      setSelectedCategoryId(null);
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
  const handleRemoveImage = () => {
    setImage("");
    message.info("Ảnh chính đã được xóa. Vui lòng upload ảnh mới.");
  };
  const handleRemoveThumbnail = (url: string): void => {
    setThumbnails((prevThumbnails) =>
      prevThumbnails.filter((thumbnail) => thumbnail !== url)
    );
    message.info("Ảnh phụ đã được xóa.");
  };
  const handleCategoryChange = (value: number | null) => {
    setSelectedCategoryId(value);
  };

  return (
    <div>
      {contextHolder}
      <div className="flex items-center justify-between mb-5">
        <Title level={3}>Thêm mới sản phẩm</Title>
        <Link to="/admin/product" style={{ color: "white" }}>
          <Button
            className="flex items-center justify-center bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-md transition duration-300 ease-in-out"
            type="primary"
            icon={<DoubleLeftOutlined />}
          >
            Quay lại
          </Button>
        </Link>
      </div>
      <div className="max-w-3xl mx-auto max-h-[450px] overflow-y-auto">
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
            rules={[
              { required: true, message: "Vui lòng nhập tên sản phẩm" },
              { min: 3, message: "Tên sản phẩm phải có ít nhất 3 ký tự" },
            ]}
          >
            <Input
              className="Input-antd text-sm placeholder-gray-400"
              placeholder="Nhập tên sản phẩm"
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
              onChange={handleCategoryChange}
            >
              {categories?.data?.map((category: Category) => (
                <Option key={category._id} value={category._id}>
                  {category.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {/* Giá sản phẩm */}
          <Form.Item
            label="Giá sản phẩm"
            name="price"
            required
            rules={[
              {
                validator(_, value) {
                  if (value === undefined || value === "") {
                    return Promise.reject(
                      new Error("Vui lòng nhập giá sản phẩm")
                    );
                  }
                  const numericValue = parseFloat(value);
                  if (isNaN(numericValue) || !isFinite(numericValue)) {
                    return Promise.reject(
                      new Error("Giá sản phẩm phải là một số hợp lệ")
                    );
                  }
                  if (numericValue <= 0) {
                    return Promise.reject(
                      new Error("Giá sản phẩm phải lớn hơn 0")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              className="Input-antd text-sm placeholder-gray-400"
              placeholder="Nhập giá sản phẩm"
            />
          </Form.Item>

          {/* Upload Ảnh Chính */}
          <Form.Item
            label="Ảnh chính"
            name="image"
            rules={[{ required: true, message: "Vui lòng upload ảnh chính" }]}
          >
            <Upload
              name="file"
              listType="picture-card"
              beforeUpload={uploadMainImage}
              maxCount={1}
              onRemove={handleRemoveImage}
            >
              <Button icon={<FileImageOutlined />}></Button>
            </Upload>
          </Form.Item>

          {/* Upload Ảnh Phụ */}
          <Form.Item label="Ảnh phụ" name="thumbnail">
            <Upload
              name="files"
              listType="picture-card"
              multiple
              fileList={thumbnails.map((url) => ({
                url,
                uid: url,
                name: "thumbnail",
              }))}
              beforeUpload={uploadThumbnails}
              onRemove={(file) => handleRemoveThumbnail(file.url as string)}
              maxCount={4}
            >
              {thumbnails.length < 4 && (
                <Button icon={<FileImageOutlined />}></Button>
              )}
            </Upload>
          </Form.Item>
          <div className="flex flex-col items-center">
            {/* Size sản phẩm */}
            <div className="flex items-center space-x-4 mb-4 w-full">
              <Form.Item
                name={["size_id"]}
                label="Size"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ít nhất một size",
                    validator: (_, values) =>
                      values && new Set(values).size === values.length
                        ? Promise.resolve()
                        : Promise.reject(new Error("Các size đã bị trùng lặp")),
                  },
                ]}
                className="flex-1 mb-0"
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn size"
                  loading={isLoadingSizes}
                  disabled={isLoadingSizes}
                  className="w-full"
                >
                  {sizes?.data
                    .filter(
                      (size: Size) =>
                        size.status === "available" && size.isDeleted === false
                    )
                    .map((size: Size) => (
                      <Option key={size._id} value={size._id}>
                        {size.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </div>

            {/* Topping sản phẩm */}
            <div className="flex items-center space-x-4 mb-4 w-full mt-6">
              <Form.Item
                name="topping_id"
                label="Topping"
                rules={[
                  {
                    validator: (_, values) => {
                      // Kiểm tra trùng lặp
                      if (values && new Set(values).size !== values.length) {
                        return Promise.reject(
                          new Error("Topping không được trùng lặp")
                        );
                      }

                      // Giới hạn số lượng topping
                      if (values && values.length > 5) {
                        return Promise.reject(
                          new Error("Chỉ được chọn tối đa 5 topping")
                        );
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
                className="flex-1 mb-0"
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn topping"
                  loading={isLoadingToppings}
                  disabled={isLoadingToppings}
                  className="w-full"
                  maxTagCount={3}
                  maxTagTextLength={10}
                  maxTagPlaceholder={(omittedValues) =>
                    `+ ${omittedValues.length} topping`
                  }
                  onSelect={(value) => {
                    const selectedTopping = toppings?.data.find(
                      (topping: Topping) => topping._id === value
                    );

                    if (
                      !selectedTopping ||
                      selectedTopping.isDeleted ||
                      selectedTopping.statusTopping !== "available"
                    ) {
                      // Loại bỏ topping không hợp lệ
                      const currentValues =
                        form.getFieldValue("topping_ids") || [];
                      form.setFieldsValue({
                        topping_ids: currentValues.filter(
                          (v: string) => v !== value
                        ),
                      });
                    }
                  }}
                >
                  {toppings?.data
                    .filter(
                      (topping: Topping) =>
                        topping.statusTopping === "available" &&
                        !topping.isDeleted
                    )
                    .map((topping: Topping) => (
                      <Option key={topping._id} value={topping._id}>
                        {topping.nameTopping}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </div>
          </div>

          <Form.Item label="Mô tả sản phẩm" name="description" className="mt-5">
            <ReactQuill theme="snow" placeholder="Nhập mô tả sản phẩm" />
          </Form.Item>

          <Form.Item
            label="Giảm giá (Tính theo %)"
            name="discount"
            initialValue={0}
            rules={[
              {
                validator(_, value) {
                  const numericValue = Number(value);
                  if (isNaN(numericValue)) {
                    return Promise.reject(
                      new Error("Giảm giá phải là một con số hợp lệ")
                    );
                  }
                  if (numericValue < 0 || numericValue > 100) {
                    return Promise.reject(
                      new Error("Giảm giá phải nằm trong khoảng từ 0 đến 100")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              className="Input-antd text-sm placeholder-gray-400"
              placeholder="Nhập giảm giá"
            />
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
