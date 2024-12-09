import React, { useCallback, useEffect, useState } from "react";
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
  Tooltip,
  Switch,
  TablePaginationConfig,
} from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import instance from "../../services/api";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  PlusCircleFilled,
  UndoOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import Title from "antd/es/typography/Title";

import Search from "antd/es/input/Search";
import { Product, ProductSize } from "../../types/product";
import { Category } from "../../types/category";

const ProductManagerPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDelete, setIsDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const navigate = useNavigate();

  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();

    if (searchTerm) params.set("search", searchTerm);
    if (selectedCategory && selectedCategory !== "allCategory") {
      params.set("category", selectedCategory);
    }
    if (selectedStatus && selectedStatus !== "allStatus") {
      params.set("status", selectedStatus);
    }
    if (isDelete) {
      params.set("isDelete", "true");
    } else {
      params.delete("isDelete");
    }
    params.set("page", currentPage.toString());
    params.set("limit", pageSize.toString());
    navigate({ search: params.toString() }, { replace: true });
  }, [
    searchTerm,
    selectedCategory,
    selectedStatus,
    currentPage,
    pageSize,
    isDelete,
    navigate,
  ]);

  useEffect(() => {
    updateUrlParams();
  }, [
    searchTerm,
    selectedCategory,
    selectedStatus,
    currentPage,
    pageSize,
    isDelete,
    updateUrlParams,
  ]);

  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "products",
      searchTerm,
      selectedCategory,
      selectedStatus,
      currentPage,
      pageSize,
      isDelete,
    ],
    queryFn: async () => {
      const categoryParam =
        selectedCategory && selectedCategory !== "allCategory"
          ? `&category=${selectedCategory}`
          : "";
      const statusParam =
        selectedStatus && selectedStatus !== "allStatus"
          ? `&status=${selectedStatus}`
          : "";
      const trashParam = isDelete ? `&isDeleted=true` : "";

      const response = await instance.get(
        `products?search=${searchTerm}${categoryParam}${statusParam}${trashParam}&page=${currentPage}&limit=${pageSize}`
      );

      return response.data;
    },
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await instance.get(`/categories`);
      return response.data;
    },
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setCurrentPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 10);
  };
  const handleIsDeleteToggle = () => {
    setIsDelete((prev) => !prev);
    setCurrentPage(1);
    updateUrlParams();
  };
  // Xử lý xóa mềm và xóa cứng (giữ nguyên)
  const mutationSoftDelete = useMutation<void, Error, string>({
    mutationFn: async (_id: string) => {
      try {
        return await instance.patch(`/products/${_id}/soft-delete`);
      } catch (error) {
        throw new Error("Xóa sản phẩm thất bại");
      }
    },
    onSuccess: () => {
      messageApi.success("Xóa sản phẩm thành công");
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
        throw new Error("Xóa vĩnh viễn sản phẩm thất bại");
      }
    },
    onSuccess: () => {
      messageApi.success("Xóa vĩnh viễn sản phẩm thành công");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      messageApi.error(`Lỗi: ${error.message}`);
    },
  });
  // Khôi phục sản phẩm
  const mutationRestoreProduct = useMutation<void, Error, string>({
    mutationFn: async (_id: string) => {
      try {
        return await instance.patch(`/products/${_id}/restore`);
      } catch (error) {
        throw new Error("Khôi phục sản phẩm thất bại");
      }
    },
    onSuccess: () => {
      message.success("Khôi phục sản phẩm thành công");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      message.error(`Lỗi: ${error.message}`);
    },
  });

  const handleStatusChange = async (checked: boolean, id: string) => {
    try {
      const newStatus = checked ? "available" : "unavailable";
      await instance.patch(`/products/${id}/update-status`, {
        status: newStatus,
      }); // Gọi API cập nhật trạng thái
      message.success("Cập nhật trạng thái sản phẩm thành công!");
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái!");
    }
  };
  const handleActiveChange = async (checked: boolean, id: string) => {
    try {
      const newActiveStatus = checked; // true nếu active, false nếu inactive
      await instance.patch(`/products/${id}/update-active`, {
        active: newActiveStatus,
      }); // Gọi API cập nhật trạng thái active
      message.success("Cập nhật trạng thái active sản phẩm thành công!");
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái active!");
    }
  };

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

  // Cột trong bảng
  const columns = [
    {
      title: "STT",
      key: "stt",
      render: (_: string, __: Product, index: number) =>
        (currentPage - 1) * pageSize + index + 1,
      width: 100,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (text: string, product: Product) => (
        <Tooltip title="Xem thêm thông tin">
          <span
            onClick={() => showModal(product)}
            className="text-gray-950 cursor-pointer hover:text-blue-700"
          >
            {text}
          </span>
        </Tooltip>
      ),
    },

    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (image: string) => (
        <Image
          src={image}
          alt="Product"
          width={50}
          height={50}
          className="object-cover"
        />
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price: number) => `${price.toLocaleString("vi-VN")} VND`,
    },

    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string, record: Product) => (
        <div className="flex items-center space-x-2">
          {/* Tooltip giải thích trạng thái */}
          <Tooltip
            title={
              status === "available" ? "Sản phẩm có sẵn" : "Sản phẩm hết hàng"
            }
          >
            <Switch
              checked={status === "available"}
              onChange={(checked) => handleStatusChange(checked, record._id)}
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              style={{
                backgroundColor: status === "available" ? "#52c41a" : "#f5222d",
              }}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category_id",
      key: "category",
      width: 100,
      render: (categories: Array<Category>) => {
        const categoryNames = categories
          .map((category) => category.title)
          .join(", ");
        return <span>{categoryNames}</span>;
      },
    },
    {
      title: "Kích hoạt",
      dataIndex: "active",
      key: "active",
      width: 100,
      render: (active: boolean, record: Product) => (
        <Tooltip
          title={active ? "Sản phẩm đang hoạt động" : "Sản phẩm tạm dừng"}
        >
          <Switch
            checked={active}
            onChange={(checked) => handleActiveChange(checked, record._id)}
            checkedChildren={<PlayCircleOutlined className="text-green-500" />}
            unCheckedChildren={<PauseCircleOutlined className="text-red-500" />}
            className={`custom-switch ${
              active ? "bg-green-500" : "bg-red-500"
            } rounded-full`}
          />
        </Tooltip>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: string, product: Product) => (
        <Space size="middle">
          {isDelete ? (
            <>
              <Popconfirm
                title="Khôi phục sản phẩm"
                description="Bạn có chắc chắn muốn khôi phục sản phẩm này?"
                onConfirm={() => mutationRestoreProduct.mutate(product._id)}
                okText="Có"
                cancelText="Không"
              >
                <Button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all">
                  <UndoOutlined className="h-4 w-4" /> Khôi phục
                </Button>
              </Popconfirm>

              <Popconfirm
                title="Xóa vĩnh viễn"
                description="Bạn có chắc chắn muốn xóa sản phẩm này vĩnh viễn?"
                onConfirm={() => mutationHardDelete.mutate(product._id)}
                okText="Có"
                cancelText="Không"
              >
                <Button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all">
                  <DeleteOutlined /> Xóa vĩnh viễn
                </Button>
              </Popconfirm>
            </>
          ) : (
            <>
              <Popconfirm
                title="Xóa sản phẩm"
                description="Bạn có chắc chắn muốn xóa sản phẩm này?"
                onConfirm={() => mutationSoftDelete.mutate(product._id)}
                okText="Có"
                cancelText="Không"
              >
                <Button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all">
                  Xóa
                </Button>
              </Popconfirm>

              <Link to={`/admin/product/${product._id}/update`}>
                <Button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all">
                  Cập nhật
                </Button>
              </Link>
            </>
          )}
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
        <Title level={3}>Danh sách sản phẩm</Title>
        <div className="flex space-x-3">
          <Search
            placeholder="Tìm kiếm sản phẩm"
            onSearch={handleSearch}
            allowClear
            style={{ width: 200 }}
          />
          <Select
            value={selectedCategory}
            onChange={(value) => setSelectedCategory(value)}
            style={{ width: 150 }}
            placeholder="Chọn danh mục"
            options={[
              { label: "Tất cả", value: "allCategory" },
              ...(categories?.data?.map((category: Category) => ({
                label: category.title,
                value: category._id,
              })) || []),
            ]}
          />
          <Select
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value)}
            style={{ width: 150 }}
            placeholder="Chọn trạng thái"
            options={[
              { label: "Tất cả", value: "allStatus" },
              { label: "Có sẵn", value: "available" },
              { label: "Hết hàng", value: "unavailable" },
            ]}
          />
          <Button
            type="primary"
            icon={<DeleteOutlined />}
            className={`transform transition-transform duration-300 ${
              isDelete ? "scale-110" : ""
            }`}
            onClick={handleIsDeleteToggle}
          >
            {isDelete ? "" : ""}
          </Button>
        </div>

        <Link to="/admin/product/add" className="flex items-center space-x-2">
          <Button
            type="primary"
            className="flex items-center justify-center bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-md transition duration-300 ease-in-out"
          >
            <PlusCircleFilled />
            <span>Thêm sản phẩm</span>
          </Button>
        </Link>
      </div>

      {/* Bảng sản phẩm */}
      <Table
        dataSource={products?.data}
        columns={columns}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: products?.pagination?.totalItems || 0,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          onChange: (page, pageSize) => {
            setCurrentPage(page);
            setPageSize(pageSize);
          },
        }}
        onChange={handleTableChange}
        scroll={{ x: "max-content", y: 350 }}
      />

      {/* Modal hiển thị chi tiết sản phẩm */}
      <Modal
        title={
          <Title level={3}>
            Chi tiết sản phẩm: {selectedProduct ? selectedProduct.name : ""}
          </Title>
        }
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={800}
        className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50"
      >
        {selectedProduct && (
          <div className="p-5 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
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

              <Descriptions.Item label="Giá sản phẩm">
                <span className="font-medium text-blue-600">
                  {`${selectedProduct.price.toLocaleString("vi-VN")} VND`}
                </span>
              </Descriptions.Item>

              <Descriptions.Item label="Giá Sale">
                <span className="font-medium text-blue-600">
                  {`${selectedProduct.sale_price.toLocaleString("vi-VN")} VND`}
                </span>

                {selectedProduct.discount > 0 && (
                  <span className="ml-2 text-red-500 font-bold">
                    -{selectedProduct.discount}%
                  </span>
                )}
              </Descriptions.Item>

              {/* Ảnh sản phẩm chính */}
              <Descriptions.Item label="Ảnh sản phẩm">
                <Image
                  src={selectedProduct.image}
                  alt="Ảnh sản phẩm"
                  width={100}
                  height={100}
                  className="rounded-md border border-gray-200 shadow-sm object-cover "
                />
              </Descriptions.Item>

              {/* Hiển thị ảnh phụ */}
              <Descriptions.Item label="Ảnh phụ" span={2}>
                <div className="overflow-hidden flex flex-wrap gap-2">
                  <Image.PreviewGroup>
                    {selectedProduct.thumbnail.length > 0 ? (
                      selectedProduct.thumbnail.map((thumbnail, index) => (
                        <Image
                          key={index}
                          src={thumbnail}
                          alt={`Ảnh phụ ${index + 1}`}
                          width={80}
                          height={80}
                          className="object-cover"
                        />
                      ))
                    ) : (
                      <p className="text-gray-500">Không có ảnh phụ</p>
                    )}
                  </Image.PreviewGroup>
                </div>
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
                    __html: selectedProduct.description
                      ? selectedProduct.description
                      : "Không có mô tả sản phẩm",
                  }}
                />
              </Descriptions.Item>
              {/* Kích thước sản phẩm */}
              <Descriptions.Item label="Kích thước và trạng thái" span={2}>
                <span className="text-gray-700">
                  {selectedProduct.product_sizes
                    .map(
                      (size: ProductSize) =>
                        `${size.size_id?.name} - ${
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
