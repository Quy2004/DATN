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
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await instance.get(`/categories`);
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
    } catch (error) {
      message.error("Upload ảnh thất bại!");
    }
  };
  useEffect(() => {
    if (products) {
      const categoryId = products.category_id[0]?._id;
      setSelectedCategoryId(categoryId);
      const productSizes = products.product_sizes.map(
        (size: ProductSize) => size.size_id?._id
      );
      const productToppings = products.product_toppings.map(
        (topping: ProductTopping) => topping.topping_id?._id
      );
      form.setFieldsValue({
        name: products.name,
        price: products.price,
        category_id: products.category_id[0]?._id,
        discount: products.discount,
        description: products.description,
        status: products.status,
        size_id: productSizes,
        topping_id: productToppings,
      });
      setImage(products.image);
      setThumbnails(products.thumbnail);
      setMainImageFileList([
        {
          uid: "-1",
          name: "main_image.jpg",
          status: "done",
          url: products.image,
        },
      ]);

      setThumbnailFileList(
        products.thumbnail.map((thumb: string, index: number) => ({
          uid: index.toString(),
          name: `thumbnail_${index + 1}.jpg`,
          status: "done",
          url: thumb,
        }))
      );
    }
  }, [products, form]);

  const mutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const product_sizes = values.size_id.map((sizeId: string) => ({
        size_id: sizeId,
        status: "available",
      }));

      const product_toppings = values.topping_id.map((toppingId: string) => ({
        topping_id: toppingId,
      }));

      const productData = {
        ...values,
        image: image || mainImageFileList[0]?.url,
        thumbnail:
          thumbnails.length > 0
            ? thumbnails
            : thumbnailFileList.map((file) => file.url),

        product_sizes,
        product_toppings,
      };

      // Gửi yêu cầu cập nhật sản phẩm
      await instance.put(`/products/${id}`, productData);
    },
    onSuccess: () => {
      message.success("Cập nhật sản phẩm thành công!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      form.resetFields(); // Reset form
      setTimeout(() => {
        navigate(`/admin/product`);
      }, 2000);
    },
    onError: (error) =>
      message.error(
        error instanceof Error ? error.message : "Cập nhật sản phẩm thất bại!"
      ),
  });

  const handleMainImageChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setMainImageFileList(fileList);
  };

  const handleThumbnailChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setThumbnailFileList(fileList);
  };
  // Thêm vào phần onRemove cho ảnh chính
  const handleRemoveMainImage = () => {
    setImage("");
    setMainImageFileList([]);
    message.info("Ảnh đã được xóa. Vui lòng upload ảnh mới.");
  };

  // Thêm vào phần onRemove cho ảnh phụ
  const handleRemoveThumbnail = (file: UploadFile) => {
    const updatedThumbnails = thumbnails.filter((thumb) => thumb !== file.url);
    setThumbnails(updatedThumbnails);
    setThumbnailFileList((prev) =>
      prev.filter((item) => item.uid !== file.uid)
    );
  };

  const handleCategoryChange = (value: number | null) => {
    setSelectedCategoryId(value);

    form.setFieldsValue({
      product_sizes: [{ size_id: undefined }],
      product_toppings: [{ topping_id: undefined }],
    });
  };

  const onFinish = (values: ProductFormValues) => {
    if (!image && mainImageFileList.length === 0) {
      message.error("Vui lòng chọn ảnh chính trước khi cập nhật!");
      return;
    }

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
        <Title level={3}>
          Cập nhật sản phẩm: {products ? products.name : ""}
        </Title>

        <Link to="/admin/product/" style={{ color: "white" }}>
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

          {/* Danh mục sản phẩm */}
          <Form.Item
            label="Danh mục"
            name="category_id"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select placeholder="Chọn danh mục" onChange={handleCategoryChange}>
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
                onChange={handleMainImageChange}
                onRemove={handleRemoveMainImage}
                maxCount={1}
                className="upload-main-image"
              >
                {mainImageFileList.length < 1 && (
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
                  setIsUploading(true);
                  uploadImage(file, false).finally(() => {
                    setIsUploading(false);
                  });
                  return false;
                }}
                onChange={handleThumbnailChange}
                onRemove={handleRemoveThumbnail}
                className="upload-thumbnail-images"
              >
                {thumbnailFileList.length < 4 && (
                  <Button
                    icon={<FileImageOutlined />}
                    loading={isUploading}
                    disabled={isUploading}
                  />
                )}
              </Upload>
            </div>
          </div>

          <div className="flex items-center space-x-4 mb-4 w-full mt-8">
            <Form.Item
              name="size_id"
              label="Size"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ít nhất một size",
                  validator: (_, values) =>
                    values && new Set(values).size === values.length
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error("Các size không được trùng lặp")
                        ),
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
                  ?.filter(
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
          <div className="flex items-center space-x-4 mb-10 w-full mt-10">
            <Form.Item
              name="topping_id"
              label="Topping"
              className="flex-1 mb-0"
            >
              <Select
                mode="multiple"
                placeholder="Chọn topping"
                loading={isLoadingToppings}
                disabled={isLoadingToppings}
                className="w-full"
              >
                {toppings?.data
                  ?.filter(
                    (topping: Topping) =>
                      topping.statusTopping === "available" &&
                      topping.isDeleted === false
                  )
                  .map((topping: Topping) => (
                    <Option key={topping._id} value={topping._id}>
                      {topping.nameTopping}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </div>

          {/* Mô tả sản phẩm */}
          <Form.Item
            label="Mô tả sản phẩm"
            name="description"
            valuePropName="value"
            className="mt-5"
          >
            <ReactQuill
              theme="snow"
              placeholder="Nhập mô tả sản phẩm"
              onChange={(value) => form.setFieldsValue({ description: value })}
            />
          </Form.Item>

          {/* Giảm giá */}
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

          {/* Trạng thái */}

          <Form.Item>
            <div className="flex justify-center mx-80">
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition"
                  loading={mutation.isPending}
                  disabled={mutation.isPending}
                >
                  {mutation.isPending
                    ? "Đang cập nhật..."
                    : "Cập nhật sản phẩm"}
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
