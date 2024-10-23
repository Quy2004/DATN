import React, { useEffect, useState } from "react";
import { Form, Input, Button, Select, Space, message, Spin } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import Title from "antd/es/typography/Title";
import { Link, useNavigate, useParams } from "react-router-dom";
import { DoubleLeftOutlined, FileImageOutlined } from "@ant-design/icons";

import Upload, { RcFile, UploadFile } from "antd/es/upload";
import axios from "axios";
import instance from "../../../services/api";
import {
  ProductFormValues,
  ProductSize,
  ProductTopping,
} from "../../../types/product";
import { Category } from "../../../types/category";
import ReactQuill from "react-quill";
import { Size } from "../../../types/size";
import { Topping } from "../../../types/topping";

const { Option } = Select;

const ProductEditPage: React.FC = () => {
  const [, contextHolder] = message.useMessage();
  const [image, setImage] = useState<string>("");
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const [mainImageFileList, setMainImageFileList] = useState<UploadFile[]>([]);
  const [thumbnailFileList, setThumbnailFileList] = useState<UploadFile[]>([]);

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

  // Fetch dữ liệu sản phẩm hiện tại
  const { data: products, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const response = await instance.get(`/products/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
  console.log(products);
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
  useEffect(() => {
    if (products) {
      form.setFieldsValue({
        name: products.name,
        price: products.price,
        category_id: products.category_id[0]?._id,
        stock: products.stock,
        discount: products.discount,
        description: products.description,
        status: products.status,
        product_sizes: products?.product_sizes.map((size: ProductSize) => ({
          size_id: size.size_id._id,
          status: size.status,
        })),
        product_toppings: products?.product_toppings.map(
          (topping: ProductTopping) => ({
            topping_id: topping.topping_id?._id,
            stock: topping.stock,
          })
        ),
      });

      setMainImageFileList([
        {
          uid: "-1",
          url: products.image,
          name: "Ảnh chính",
          status: "done",
        },
      ]);

      setThumbnailFileList(
        products.thumbnail.map((thumb: string, index: number) => ({
          uid: `${index}`,
          url: thumb,
          name: `Ảnh phụ ${index + 1}`,
          status: "done",
        }))
      );
    }
  }, [products, form]);

  const mutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const productData = {
        ...values,
        image: image || mainImageFileList[0]?.url,
        thumbnail:
          thumbnails.length > 0
            ? thumbnails
            : thumbnailFileList.map((file) => file.url),

        product_sizes: values.product_sizes.map((size: ProductSize) => ({
          size_id: size.size_id,
          status: size.status,
        })),

        product_toppings: values.product_toppings.map(
          (topping: ProductTopping) => ({
            topping_id: topping.topping_id,
          })
        ),
      };

      // Gửi yêu cầu cập nhật sản phẩm
      await instance.put(`/products/${id}`, productData);
    },
    onSuccess: () => {
      message.success("Cập nhật sản phẩm thành công!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setTimeout(() => {
        navigate(`/admin/product`);
      }, 2000);
    },
    onError: (error) =>
      message.error(
        error instanceof Error ? error.message : "Cập nhật sản phẩm thất bại!"
      ),
  });

  // Submit form với mutation
  const onFinish = (values: ProductFormValues) => {
    mutation.mutate(values);
  };

  if (
    isLoadingProduct ||
    isLoadingCategories ||
    isLoadingSizes ||
    isLoadingToppings
  ) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div>
      {contextHolder}
      <div className="flex items-center justify-between mb-5">
        <Title level={3}>Cập nhật sản phẩm</Title>
        <Button
          className="flex items-center justify-center bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-md transition duration-300 ease-in-out"
          type="primary"
          icon={<DoubleLeftOutlined />}
        >
          <Link to="/admin/product/" style={{ color: "white" }}>
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
            <Input placeholder="Nhập tên sản phẩm" />
          </Form.Item>

          {/* Danh mục sản phẩm */}
          <Form.Item
            label="Danh mục"
            name="category_id"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select placeholder="Chọn danh mục">
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
            rules={[
              {
                validator(_, value) {
                  if (!value) {
                    return Promise.reject(
                      new Error("Vui lòng nhập giá sản phẩm")
                    );
                  }
                  const numericValue = Number(value);
                  if (isNaN(numericValue)) {
                    return Promise.reject(
                      new Error("Giá sản phẩm phải là một số hợp lệ")
                    );
                  } else if (numericValue <= 0) {
                    return Promise.reject(
                      new Error("Giá sản phẩm phải lớn hơn 0")
                    );
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Nhập giá sản phẩm" />
          </Form.Item>

          <div className="flex flex-col gap-5 mt-5 justify-center items-center">
            {/* Upload ảnh chính */}
            <div className="flex flex-col items-center gap-2.5 w-full">
              <h4 className="text-center">Ảnh chính</h4>
              <Upload
                name="file"
                listType="picture-card"
                fileList={mainImageFileList}
                beforeUpload={(file) => {
                  uploadImage(file, true);
                  return false;
                }}
                onChange={({ fileList }) => setMainImageFileList(fileList)}
                maxCount={1}
                className="upload-main-image"
              >
                {mainImageFileList.length === 0 && (
                  <Button icon={<FileImageOutlined />}></Button>
                )}
              </Upload>
            </div>

            {/* Upload ảnh phụ */}
            <div className="flex flex-col items-center gap-2.5 w-full">
              <h4 className="text-center">Ảnh phụ</h4>
              <Upload
                name="files"
                listType="picture-card"
                multiple
                fileList={thumbnailFileList}
                beforeUpload={(file) => {
                  uploadImage(file, false);
                  return false;
                }}
                onChange={({ fileList }) => setThumbnailFileList(fileList)}
                className="upload-thumbnail-images"
              >
                {thumbnailFileList.length < 4 && (
                  <Button icon={<FileImageOutlined />}></Button>
                )}
              </Upload>
            </div>
          </div>

          <div className="flex flex-col items-center mt-5">
            {/* Size sản phẩm */}
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
                        rules={[
                          { required: true, message: "Chọn size" },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value) {
                                return Promise.reject(
                                  new Error("Vui lòng chọn một size")
                                );
                              }
                              const sizeValues = getFieldValue(
                                "product_sizes"
                              ).map((item: ProductSize) => item.size_id);
                              if (
                                sizeValues.filter((v: string) => v === value)
                                  .length > 1
                              ) {
                                return Promise.reject(
                                  new Error("Size đã bị trùng lặp")
                                );
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
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
                      {/* Validate không trùng topping và kiểm tra nếu không có topping nào được chọn */}
                      <Form.Item
                        name={[field.name, "topping_id"]}
                        label="Topping"
                        rules={[
                          { required: true, message: "Chọn topping" },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value) {
                                return Promise.reject(
                                  new Error("Vui lòng chọn một topping")
                                );
                              }
                              const toppingValues = getFieldValue(
                                "product_toppings"
                              ).map((item: ProductTopping) => item.topping_id);
                              if (
                                toppingValues.filter((v: string) => v === value)
                                  .length > 1
                              ) {
                                return Promise.reject(
                                  new Error("Topping đã bị trùng lặp")
                                );
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
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

          {/* Mô tả sản phẩm */}
          <Form.Item
            label="Mô tả sản phẩm"
            name="description"
            valuePropName="value"
            rules={[
              {
                validator(_, value) {
                  if (
                    value &&
                    value.replace(/<\/?[^>]+(>|$)/g, "").trim() !== ""
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mô tả sản phẩm không được để trống")
                  );
                },
              },
            ]}
            className="mt-5"
          >
            <ReactQuill
              theme="snow"
              placeholder="Nhập mô tả sản phẩm"
              onChange={(value) => form.setFieldsValue({ description: value })} // Cập nhật giá trị vào form
            />
          </Form.Item>

          {/* Giảm giá */}
          <Form.Item
            label="Giảm giá (Tính theo %)"
            name="discount"
            initialValue={0}
            rules={[
              { required: true, message: "Vui lòng nhập giảm giá" },
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
            <Input placeholder="Nhập giảm giá" />
          </Form.Item>

          {/* Trạng thái */}
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
                  Cập nhật sản phẩm
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

export default ProductEditPage;
