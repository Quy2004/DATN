import React, { useEffect, useState } from "react";
import {
  Table,
  Space,
  Button,
  message,
  Popconfirm,
  Image,
  Spin,
  Alert,
  Modal,
  Descriptions,
  Select,
} from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import instance from "../../services/api";
import { PlusCircleFilled } from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Title from "antd/es/typography/Title";
import { Product, ProductSize } from "../../types/product";
import { Category } from "../../types/category";
import Search from "antd/es/input/Search";

const ProductManagerPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchValue = params.get("search") || "";
    const categoryValue = params.get("category") || undefined;
    setSearchTerm(searchValue);
    setSelectedCategory(categoryValue);
  }, [location.search]);


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (searchTerm) {
      params.set("search", searchTerm);
    } else if (selectedCategory) {
      params.set("category", selectedCategory);
    }
    navigate({ search: params.toString() }, { replace: true });
  }, [searchTerm, selectedCategory, navigate]);
  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products", searchTerm, selectedCategory],
    queryFn: async () => {
      const categoryParam =
        selectedCategory && selectedCategory !== "allCategory"
          ? `&category=${selectedCategory}`
          : "";
      const response = await instance.get(
        `products?search=${searchTerm}${categoryParam}`
      );
      return response.data.data;
    },
  });
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await instance.get(`/categories`);
      return response.data;
    },
  });
  // Xử lý xóa mềm và xóa cứng (giữ nguyên)
  const mutationSoftDelete = useMutation<void, Error, string>({
    mutationFn: async (_id: string) => {
      try {
        return await instance.patch(`/products/${_id}/soft-delete`);
      } catch (error) {
        throw new Error("Xóa mềm sản phẩm thất bại");
      }
    },
    onSuccess: () => {
      messageApi.success("Xóa mềm sản phẩm thành công");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      messageApi.error(`Lỗi: ${error.message}`);
    },
  });

  const mutationHardDelete = useMutation<void, Error, string>({
    mutationFn: async (_id: string) => {
      try {
        return await instance.delete(`/products/${_id}/hard-delete`);
      } catch (error) {
        throw new Error("Xóa cứng sản phẩm thất bại");
      }
    },
    onSuccess: () => {
      messageApi.success("Xóa cứng sản phẩm thành công");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      messageApi.error(`Lỗi: ${error.message}`);
    },
  });

  // Hàm để hiển thị chi tiết sản phẩm trong Modal
  const showModal = (product: Product) => {
    setSelectedProduct(product); // Lưu sản phẩm được chọn
    setIsModalVisible(true); // Mở Modal
  };

  // Hàm để đóng Modal
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedProduct(null); // Reset sản phẩm khi đóng Modal
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Cột trong bảng
  const columns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Ảnh sản phẩm",
      dataIndex: "image",
      key: "image",
      render: (image: string) => (
        <Image
          src={image}
          alt="Product"
          style={{ width: "100px", height: "auto" }}
        />
      ),
    },
    {
      title: "Giá sản phẩm",
      dataIndex: "price",
      key: "price",
      render: (price: number) => `${price.toLocaleString("vi-VN")} VND`,
    },
    {
      title: "Danh mục",
      dataIndex: "category_id",
      key: "category",
      render: (categories: Array<Category>) => {
        const categoryNames = categories
          .map((category) => category.title)
          .join(", ");
        return <span>{categoryNames}</span>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span style={{ color: status === "available" ? "green" : "red" }}>
          {status === "available" ? "Có sẵn" : "Hết hàng"}
        </span>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: string, product: Product) => (
        <Space size="middle">
          {/* Nút để hiển thị chi tiết sản phẩm */}
          <Button
            onClick={() => showModal(product)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
          >
            Xem chi tiết
          </Button>

          <Popconfirm
            title="Bạn có chắc chắn muốn xóa mềm sản phẩm này?"
            onConfirm={() => mutationSoftDelete.mutate(product._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all">
              Xóa mềm
            </Button>
          </Popconfirm>

          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sản phẩm này vĩnh viễn?"
            onConfirm={() => mutationHardDelete.mutate(product._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all">
              Xóa cứng
            </Button>
          </Popconfirm>

          <Link to={`/admin/product/${product._id}/update`}>
            <Button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all">
              Cập nhật
            </Button>
          </Link>
        </Space>
      ),
    },
  ];

  if (isLoading || isLoadingCategories) {
    return (
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <Spin tip="Đang tải dữ liệu..." size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <Alert
          message="Đã xảy ra lỗi"
          description="Có lỗi trong quá trình tải dữ liệu. Vui lòng thử lại sau."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div>
      {contextHolder}
      <div className="flex items-center justify-between mb-5">
        <Title level={3}>Quản lý sản phẩm</Title>
        <div className="flex space-x-3">
          <Search
            placeholder="Tìm kiếm sản phẩm"
            onSearch={handleSearch}
            allowClear
            style={{ width: 300 }}
          />
          <Select
            value={selectedCategory}
            onChange={(value) => setSelectedCategory(value)}
            style={{ width: 200 }}
            placeholder="Chọn danh mục"
            options={[
              { label: "Tất cả danh mục", value: "allCategory" },
              ...(categories?.data.map((category: Category) => ({
                label: category.title,
                value: category._id,
              })) || []),
            ]}
          />
        </div>

        <Button type="primary" icon={<PlusCircleFilled />}>
          <Link to="/admin/product/add" style={{ color: "white" }}>
            Thêm sản phẩm
          </Link>
        </Button>
      </div>

      {/* Bảng sản phẩm */}
      <Table columns={columns} dataSource={products} rowKey="_id" />

      {/* Modal hiển thị chi tiết sản phẩm */}
      <Modal
        title="Chi tiết sản phẩm"
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={800}
      >
        {selectedProduct && (
          <div className="p-5">
            <Descriptions
              bordered
              column={2}
              className="bg-gray-50 rounded-lg shadow-sm border border-gray-200"
            >
              {/* Tên sản phẩm */}
              <Descriptions.Item label="Tên sản phẩm" span={2}>
                <span className="font-semibold text-lg text-gray-900">
                  {selectedProduct.name}
                </span>
              </Descriptions.Item>

              {/* Giá sản phẩm */}
              <Descriptions.Item label="Giá sản phẩm">
                <span className="font-medium text-blue-600">
                  {`${selectedProduct.price.toLocaleString("vi-VN")} VND`}
                </span>
              </Descriptions.Item>

              {/* Ảnh sản phẩm chính */}
              <Descriptions.Item label="Ảnh sản phẩm">
                <Image
                  src={selectedProduct.image}
                  alt="Ảnh sản phẩm"
                  width={100}
                  className="rounded-md border border-gray-200 shadow-sm "
                />
              </Descriptions.Item>

              {/* Hiển thị ảnh phụ */}
              <Descriptions.Item label="Ảnh phụ" span={2}>
                <Image.PreviewGroup>
                  {selectedProduct.thumbnail.map((thumbnail, index) => (
                    <Image
                      key={index}
                      src={thumbnail}
                      alt={`Ảnh phụ ${index + 1}`}
                      width={100}
                      style={{ marginRight: 8 }}
                    />
                  ))}
                </Image.PreviewGroup>
              </Descriptions.Item>

              {/* Danh mục sản phẩm */}
              <Descriptions.Item label="Danh mục" span={2}>
                <span className="text-gray-700">
                  {selectedProduct.category_id
                    .map((category: Category) => category.title)
                    .join(", ")}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả sản phẩm" span={2}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: selectedProduct.description,
                  }}
                />
              </Descriptions.Item>

              {/* Kích thước sản phẩm */}
              <Descriptions.Item label="Kích thước và trạng thái" span={2}>
                <span className="text-gray-700">
                  {selectedProduct.product_sizes
                    .map(
                      (size: ProductSize) =>
                        `${size.size_id.name} - ${
                          size.status === "available" ? "Có sẵn" : "Hết hàng"
                        }`
                    )
                    .join(", ")}
                </span>
              </Descriptions.Item>

              {/* Topping */}
              <Descriptions.Item label="Topping" span={2}>
                <span className="text-gray-700">
                  {selectedProduct.product_toppings.length > 0
                    ? selectedProduct.product_toppings
                        .map((topping) => topping.topping_id?.nameTopping || "")
                        .filter(Boolean)
                        .join(", ")
                    : "Không có topping"}
                </span>
              </Descriptions.Item>

              {/* Tồn kho */}
              <Descriptions.Item label="Tồn kho">
                <span className="text-gray-700">{selectedProduct.stock}</span>
              </Descriptions.Item>

              {/* Trạng thái sản phẩm */}
              <Descriptions.Item label="Trạng thái">
                <span
                  className={`font-semibold ${
                    selectedProduct.status === "available"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {selectedProduct.status === "available"
                    ? "Có sẵn"
                    : "Hết hàng"}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductManagerPage;
