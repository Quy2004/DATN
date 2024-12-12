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
  Product,
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

  // const mutation = useMutation({
  //   mutationFn: async (values: ProductFormValues) => {
  //     const product_sizes = values.size_id.map((sizeId: string) => ({
  //       size_id: sizeId,
  //       status: "available",
  //     }));

  //     const product_toppings = values.topping_id.map((toppingId: string) => ({
  //       topping_id: toppingId,
  //     }));

  //     const productData = {
  //       ...values,
  //       image: image || mainImageFileList[0]?.url,
  //       thumbnail:
  //         thumbnails.length > 0
  //           ? thumbnails
  //           : thumbnailFileList.map((file) => file.url),

  //       product_sizes,
  //       product_toppings,
  //     };

  //     // Gửi yêu cầu cập nhật sản phẩm
  //     await instance.put(`/products/${id}`, productData);
  //   },
  //   onSuccess: () => {
  //     message.success("Cập nhật sản phẩm thành công!");
  //     queryClient.invalidateQueries({ queryKey: ["products"] });
  //     form.resetFields();
  //     setImage("");
  //     setThumbnails([]);
  //     setMainImageFileList([]);
  //     setThumbnailFileList([]);
  //     setTimeout(() => {
  //       navigate(`/admin/product`);
  //     }, 2000);
  //   },
  //   onError: (error) =>
  //     message.error(
  //       error instanceof Error ? error.message : "Cập nhật sản phẩm thất bại!"
  //     ),
  // });

  const mutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      // First check if selected category still exists and is active
      const categoryResponse = await instance.get(
        `/categories/${values.category_id}`
      );
      const selectedCategory = categoryResponse.data;

      if (!selectedCategory || selectedCategory.isDeleted) {
        throw new Error("Danh mục đã bị xóa, vui lòng chọn danh mục khác");
      }

      // Validate sizes
      const selectedSizes = values.size_id;
      const availableSizes = sizes?.data.filter(
        (size: Size) => size.status === "available" && !size.isDeleted
      );
      const invalidSizes = selectedSizes.filter(
        (sizeId: string) => !availableSizes?.find((s: Size) => s._id === sizeId)
      );

      if (invalidSizes.length > 0) {
        throw new Error(
          "Một số size đã bị xóa hoặc không khả dụng, vui lòng chọn lại"
        );
      }

      // Validate toppings
      const selectedToppings = values.topping_id;
      const availableToppings = toppings?.data.filter(
        (topping: Topping) =>
          topping.statusTopping === "available" && !topping.isDeleted
      );
      const invalidToppings = selectedToppings.filter(
        (toppingId: string) =>
          !availableToppings?.find((t: Topping) => t._id === toppingId)
      );

      if (invalidToppings.length > 0) {
        throw new Error(
          "Một số topping đã bị xóa hoặc không khả dụng, vui lòng chọn lại"
        );
      }

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

      await instance.put(`/products/${id}`, productData);
    },
    onSuccess: () => {
      message.success("Cập nhật sản phẩm thành công!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      form.resetFields();
      setImage("");
      setThumbnails([]);
      setMainImageFileList([]);
      setThumbnailFileList([]);
      setTimeout(() => {
        navigate("/admin/product");
      }, 2000);
    },
    onError: (error) => {
      message.error(
        error instanceof Error ? error.message : "Cập nhật sản phẩm thất bại!"
      );
    },
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

  const handleCategoryChange = async (value: number | null) => {
    try {
      if (value) {
        // Check if selected category exists and is active
        const categoryResponse = await instance.get(`/categories/${value}`);
        const selectedCategory = categoryResponse.data;

        if (!selectedCategory || selectedCategory.isDeleted) {
          message.error("Danh mục này đã bị xóa, vui lòng chọn danh mục khác");
          setSelectedCategoryId(null);
          form.setFieldsValue({
            category_id: undefined,
            size_id: [],
            topping_id: [],
          });
          return;
        }

        // Get current form values
        const currentSizes = form.getFieldValue("size_id") || [];
        const currentToppings = form.getFieldValue("topping_id") || [];

        // Fetch new sizes and toppings for selected category
        const [sizesResponse, toppingsResponse] = await Promise.all([
          instance.get(`/sizes?category=${value}`),
          instance.get(`/toppings?category=${value}`),
        ]);

        const availableSizes = sizesResponse.data.data.filter(
          (size: Size) => size.status === "available" && !size.isDeleted
        );

        const availableToppings = toppingsResponse.data.data.filter(
          (topping: Topping) =>
            topping.statusTopping === "available" && !topping.isDeleted
        );

        // Filter out invalid sizes and toppings
        const validSizes = currentSizes.filter((sizeId: string) =>
          availableSizes.some((size: Size) => size._id === sizeId)
        );

        const validToppings = currentToppings.filter((toppingId: string) =>
          availableToppings.some(
            (topping: Topping) => topping._id === toppingId
          )
        );

        // If any items were removed, show warning message
        if (validSizes.length < currentSizes.length) {
          message.warning("Một số size đã bị xóa hoặc không còn khả dụng");
        }

        if (validToppings.length < currentToppings.length) {
          message.warning("Một số topping đã bị xóa hoặc không còn khả dụng");
        }

        form.setFieldsValue({
          size_id: validSizes,
          topping_id: validToppings,
        });
      }

      setSelectedCategoryId(value);
    } catch (error) {
      message.error("Không thể kiểm tra trạng thái danh mục");
    }
  };

  useEffect(() => {
    if (sizes?.data) {
      const currentSizes = form.getFieldValue("size_id") || [];
      const availableSizes = sizes.data.filter(
        (size: Size) => size.status === "available" && !size.isDeleted
      );

      const validSizes = currentSizes.filter((sizeId: string) =>
        availableSizes.some((size: Size) => size._id === sizeId)
      );

      if (validSizes.length < currentSizes.length) {
        form.setFieldsValue({ size_id: validSizes });
      }
    }
  }, [sizes]);

  useEffect(() => {
    if (toppings?.data) {
      const currentToppings = form.getFieldValue("topping_id") || [];
      const availableToppings = toppings.data.filter(
        (topping: Topping) =>
          topping.statusTopping === "available" && !topping.isDeleted
      );

      const validToppings = currentToppings.filter((toppingId: string) =>
        availableToppings.some((topping: Topping) => topping._id === toppingId)
      );

      if (validToppings.length < currentToppings.length) {
        form.setFieldsValue({ topping_id: validToppings });
      }
    }
  }, [toppings]);
  const onFinish = async (values: ProductFormValues) => {
    if (!image && mainImageFileList.length === 0) {
      message.error("Vui lòng chọn ảnh chính trước khi cập nhật!");
      return;
    }

    try {
      // Check category status
      const categoryResponse = await instance.get(
        `/categories/${values.category_id}`
      );
      const selectedCategory = categoryResponse.data;

      if (!selectedCategory || selectedCategory.isDeleted) {
        return;
      }

      mutation.mutate(values);
    } catch (error) {
      message.error("Không thể kiểm tra trạng thái danh mục");
    }
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
      <div className="w-full mx-auto max-h-[450px] overflow-y-auto">
        <Form
          form={form}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ width: 500, marginLeft: 240 }}
          onFinish={onFinish}
        >
          {/* Tên sản phẩm */}
          <Form.Item
            label="Tên sản phẩm"
            name="name"
            required
            rules={[
              { min: 3, message: "Tên sản phẩm phải có ít nhất 3 ký tự" },
              {
                validator: async (_, value) => {
                  if (!value) {
                    return Promise.reject(
                      new Error("Vui lòng nhập tên sản phẩm")
                    );
                  }

                  // Loại bỏ khoảng trắng thừa ở đầu và cuối, và thay thế nhiều khoảng trắng bằng 1 khoảng
                  const trimmedValue = value.trim().replace(/\s+/g, " ");
                  const hasNumber = /\d/;
                  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>[\]\\/_+=-]/;

                  // Kiểm tra số và ký tự đặc biệt
                  if (hasNumber.test(trimmedValue)) {
                    return Promise.reject(
                      new Error("Tên sản phẩm không được chứa số!")
                    );
                  }

                  if (hasSpecialChar.test(trimmedValue)) {
                    return Promise.reject(
                      new Error("Tên sản phẩm không được chứa ký tự đặc biệt!")
                    );
                  }

                  try {
                    const response = await instance.get(
                      `/products?name=${encodeURIComponent(
                        trimmedValue
                      )}&limit=50`
                    );
                    const existingProduct = response.data.data.find(
                      (product: Product) =>
                        product.name
                          .trim()
                          .replace(/\s+/g, " ")
                          .toLowerCase() === trimmedValue.toLowerCase()
                    );

                    if (existingProduct) {
                      return Promise.reject(
                        new Error(
                          "Tên sản phẩm đã tồn tại. Vui lòng chọn tên khác!"
                        )
                      );
                    }
                  } catch (error) {
                    return Promise.reject(
                      new Error("Có lỗi xảy ra khi kiểm tra tên sản phẩm!")
                    );
                  }

                  return Promise.resolve();
                },
              },
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
                { required: true, message: "Vui lòng chọn ít nhất một size" },
              ]}
              className="flex-1 mb-0"
            >
              <Select
                mode="multiple"
                placeholder="Chọn size"
                loading={isLoadingSizes}
                disabled={isLoadingSizes}
                className="w-full"
                onSelect={(value) => {
                  const selectedSize = sizes?.data.find(
                    (size: Size) => size._id === value
                  );
                  if (
                    !selectedSize ||
                    selectedSize.isDeleted ||
                    selectedSize.status !== "available"
                  ) {
                    message.error("Size này không còn khả dụng");
                    const currentValues = form.getFieldValue("size_id") || [];
                    form.setFieldsValue({
                      size_id: currentValues.filter((v: string) => v !== value),
                    });
                  }
                }}
              >
                {sizes?.data
                  .filter(
                    (size: Size) =>
                      size.status === "available" && !size.isDeleted
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
                    const currentValues =
                      form.getFieldValue("topping_id") || [];
                    form.setFieldsValue({
                      topping_id: currentValues.filter(
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
            label="Giảm giá (%)"
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
