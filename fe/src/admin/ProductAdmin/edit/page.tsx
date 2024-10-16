import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Space,
  message,
  Spin,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "../../../services/api";
import Title from "antd/es/typography/Title";
import { Link, useNavigate, useParams } from "react-router-dom";
import { DoubleLeftOutlined, UploadOutlined } from "@ant-design/icons";

import {
  ProductFormValues,
  ProductSize,
  ProductTopping,
  Size,
  Topping,
} from "../../../types/product";
import { Category } from "../../../types/category";
import Upload, { RcFile, UploadFile } from "antd/es/upload";
import axios from "axios";

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

  // Fetch thông tin các danh mục
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await instance.get(`/categories`);
      return response.data;
    },
  });

  // Fetch thông tin các size
  const { data: sizes, isLoading: isLoadingSizes } = useQuery({
    queryKey: ["sizes"],
    queryFn: async () => {
      const response = await instance.get(`/size`);
      return response.data;
    },
  });

  // Fetch thông tin các topping
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
    enabled: !!id, // Chỉ fetch nếu có id
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
        category_id: products.category_id[0]?._id,
        stock: products.stock,
        discount: products.discount,
        status: products.status,
        product_sizes: products.product_sizes.map((size: ProductSize) => ({
          size_id: size.size_id._id,
          price: size.price,
          stock: size.stock,
        })),
        product_toppings: products.product_toppings.map(
          (topping: ProductTopping) => ({
            topping_id: topping.topping_id._id,
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
      // Đảm bảo `thumbnails` luôn được gửi đầy đủ
      const productData = {
        ...values,
        image: image || mainImageFileList[0]?.url,
        thumbnail:
          thumbnails.length > 0
            ? thumbnails
            : thumbnailFileList.map((file) => file.url),
        product_sizes: values.product_sizes.map((size: ProductSize) => ({
          size_id: size.size_id,
          price: size.price,
          stock: size.stock,
        })),
        product_toppings: values.product_toppings.map(
          (topping: ProductTopping) => ({
            topping_id: topping.topping_id,
            stock: topping.stock,
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
        <Button type="primary" icon={<DoubleLeftOutlined />}>
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
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
          >
            <Input placeholder="Nhập tên sản phẩm" />
          </Form.Item>

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
          <div className="flex flex-col gap-5 mt-5">
            {/* Upload ảnh chính */}
            <div className="flex flex-col items-start gap-2.5">
              <h4>Ảnh chính</h4>
              <Upload
                name="file"
                listType="picture-card"
                fileList={mainImageFileList}
                beforeUpload={(file) => {
                  uploadImage(file, true); // Gọi hàm upload ảnh chính
                  return false; // Ngăn việc upload mặc định
                }}
                onChange={({ fileList }) => setMainImageFileList(fileList)} // Cập nhật state khi có sự thay đổi
                maxCount={1}
                className="upload-main-image"
              >
                {mainImageFileList.length === 0 && (
                  <Button icon={<UploadOutlined />}>Chọn ảnh chính</Button>
                )}
              </Upload>
            </div>

            {/* Upload ảnh phụ */}
            <div className="flex flex-col items-start gap-2.5">
              <h4>Ảnh phụ</h4>
              <Upload
                name="files"
                listType="picture-card"
                multiple
                fileList={thumbnailFileList}
                beforeUpload={(file) => {
                  uploadImage(file, false);
                  return false;
                }}
                onChange={({ fileList }) => setThumbnailFileList(fileList)} // Cập nhật state khi có sự thay đổi
                className="upload-thumbnail-images"
              >
                {thumbnailFileList.length < 4 && (
                  <Button icon={<UploadOutlined />}>Chọn ảnh phụ</Button>
                )}
              </Upload>
            </div>
          </div>

          <div className="flex flex-col items-center mt-5">
            <Form.List name="product_sizes">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <div
                      key={field.key}
                      className="flex items-center space-x-4 mb-4 w-full max-w-3xl"
                    >
                      <Form.Item
                        name={[field.name, "size_id"]}
                        label="Size"
                        rules={[{ required: true, message: "Chọn size" }]}
                        className="flex-1"
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
                        name={[field.name, "price"]}
                        label="Giá"
                        rules={[{ required: true, message: "Nhập giá" }]}
                        className="flex-1"
                      >
                        <InputNumber
                          placeholder="Giá"
                          min={0}
                          className="w-full"
                        />
                      </Form.Item>

                      <Form.Item
                        name={[field.name, "stock"]}
                        label="Tồn kho"
                        rules={[{ required: true, message: "Nhập tồn kho" }]}
                        className=""
                      >
                        <InputNumber
                          placeholder="Tồn kho"
                          min={0}
                          className="mx-3"
                        />
                      </Form.Item>

                      <Button
                        onClick={() => remove(field.name)}
                        danger
                        className="text-red-500"
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
                      <Form.Item
                        name={[field.name, "topping_id"]}
                        label="Topping"
                        rules={[{ required: true, message: "Chọn topping" }]}
                        className="flex-1"
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

                      <Form.Item
                        name={[field.name, "stock"]}
                        label="Tồn kho"
                        rules={[{ required: true, message: "Nhập tồn kho" }]}
                        className="flex-1"
                      >
                        <InputNumber
                          placeholder="Tồn kho"
                          min={0}
                          className="w-full"
                        />
                      </Form.Item>

                      <Button
                        onClick={() => remove(field.name)}
                        danger
                        className="text-red-500"
                      >
                        Xóa
                      </Button>
                    </div>
                  ))}

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

          {/* Tồn kho tổng */}
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

          {/* Giảm giá */}
          <Form.Item
            label="Giảm giá (Tính theo %)"
            name="discount"
            rules={[{ required: true, message: "Vui lòng nhập giảm giá" }]}
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

          {/* Nút Lưu */}
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