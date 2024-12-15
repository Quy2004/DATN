import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  PlusCircleFilled,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Descriptions,
  message,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Table,
  Select,
  Switch,
} from "antd";
import Search from "antd/es/input/Search";
import Title from "antd/es/typography/Title";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import instance from "../../services/api";
import { Size } from "../../types/size";
import { Category } from "../../types/category";
import { Tooltip } from "flowbite-react";

const SizeManagerPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [isDelete, setIsDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );

  const navigate = useNavigate();

  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedCategory && selectedCategory !== "allCategory") {
      params.set("category", selectedCategory);
    }
    if (isDelete) {
      params.set("isDelete", "true");
    } else {
      params.delete("isDelete");
    }
    params.set("page", currentPage.toString());
    params.set("limit", pageSize.toString());
    navigate({ search: params.toString() }, { replace: true });
  }, [searchTerm, selectedCategory, currentPage, pageSize, isDelete, navigate]);

  useEffect(() => {
    updateUrlParams();
  }, [
    searchTerm,
    selectedCategory,
    currentPage,
    pageSize,
    isDelete,
    updateUrlParams,
  ]);

  const {
    data: sizes,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "sizes",
      searchTerm,
      selectedCategory,
      currentPage,
      pageSize,
      isDelete,
    ],
    queryFn: async () => {
      const categoryParam =
        selectedCategory && selectedCategory !== "allCategory"
          ? `&category=${selectedCategory}`
          : "";
      const trashParam = isDelete ? `&isDeleted=true` : "";
      const response = await instance.get(
        `sizes?search=${searchTerm}${categoryParam}&page=${currentPage}&limit=${pageSize}${trashParam}`
      );
      return response.data;
    },
  });

  // Lấy danh sách danh mục từ API
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await instance.get("/categories"); // Gọi API lấy danh mục
      return response.data;
    },
  });

  // Tìm tên danh mục dựa trên category_id
  const getCategoryName = (category: {
    _id: string;
    title: string;
  }): string => {
    // Kiểm tra nếu category là một đối tượng chứa title
    if (category && category.title) {
      return category.title;
    }

    // Nếu không, sử dụng dữ liệu từ categoriesData
    if (
      !categoriesData ||
      !Array.isArray(categoriesData.data) ||
      categoriesData.data.length === 0
    ) {
      return "Không xác định";
    }

    const foundCategory = categoriesData.data.find(
      (cat: Category) => cat._id === category?._id
    );

    return foundCategory ? foundCategory.title : "Không xác định";
  };

  const mutationSoftDelete = useMutation<void, Error, string>({
    mutationFn: async (_id: string) => {
      try {
        return await instance.patch(`/sizes/${_id}/soft-delete`);
      } catch (error) {
        throw new Error("Xóa mềm size thất bại");
      }
    },
    onSuccess: () => {
      messageApi.success("Xóa mềm size thành công");
      queryClient.invalidateQueries({ queryKey: ["sizes"] });
    },
    onError: (error) => {
      messageApi.error(`Lỗi: ${error.message}`);
    },
  });

  // Khôi phục size
  const mutationRestore = useMutation<void, Error, string>({
    mutationFn: async (_id: string) => {
      try {
        return await instance.patch(`/sizes/${_id}/restore`);
      } catch (error) {
        throw new Error("Khôi phục size thất bại");
      }
    },
    onSuccess: () => {
      message.success("Khôi phục size thành công");
      queryClient.invalidateQueries({ queryKey: ["sizes"] });
    },
    onError: (error) => {
      message.error(`Lỗi: ${error.message}`);
    },
  });

  const mutationHardDelete = useMutation<void, Error, string>({
    mutationFn: async (_id: string) => {
      try {
        return await instance.delete(`/sizes/${_id}`);
      } catch (error) {
        throw new Error("Xóa cứng size thất bại");
      }
    },
    onSuccess: () => {
      messageApi.success("Xóa cứng size thành công");
      queryClient.invalidateQueries({ queryKey: ["sizes"] });
    },
    onError: (error) => {
      messageApi.error(`Lỗi: ${error.message}`);
    },
  });

  const handleStatusChange = async (checked: boolean, id: string) => {
    try {
      const newStatus = checked ? "available" : "unavailable";
      await instance.patch(`/sizes/${id}/update-status`, {
        status: newStatus,
      }); // Gọi API cập nhật trạng thái
      message.success("Cập nhật trạng thái size thành công!");
      queryClient.invalidateQueries({
        queryKey: ["sizes"],
      });
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái!");
    }
  };

  const showModal = (size: Size) => {
    setSelectedSize(size);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedSize(null);
  };

  const columns = [
    {
      title: "Tên size",
      dataIndex: "name",
      key: "name",
      render: (text: string, size: Size) => (
        <span
          onClick={() => showModal(size)}
          className="text-gray-950 cursor-pointer hover:text-blue-700"
        >
          {text}
        </span>
      ),
    },
    {
      title: "Giá size",
      dataIndex: "priceSize",
      key: "priceSize",
      render: (price: number) => `${price.toLocaleString("vi-VN")} VND`,
    },
    {
      title: "Danh mục",
      dataIndex: "category_id", // Giả sử category_id là một đối tượng có _id và title
      key: "category_id",
      render: (category_id: { _id: string; title: string }) =>
        getCategoryName(category_id),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: Size) => (
        <div className="flex items-center space-x-2">
          {/* Tooltip giải thích trạng thái */}
          <Tooltip
            content={status === "available" ? "Size có sẵn" : "Size hết hàng"}
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
      title: "Hành động",
      key: "action",
      render: (_: string, size: Size) => (
        <Space size="middle">
          {isDelete ? (
            <>
              <Popconfirm
                title="Khôi phục size"
                description="Bạn có chắc chắn muốn khôi phục size này?"
                onConfirm={() => mutationRestore.mutate(size._id)}
                okText="Có"
                cancelText="Không"
              >
                <Button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all">
                  Khôi phục
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Xóa cứng size"
                description="Bạn có chắc chắn muốn xóa size này vĩnh viễn?"
                onConfirm={() => mutationHardDelete.mutate(size._id)}
                okText="Có"
                cancelText="Không"
              >
                <Button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all">
                  Xóa vĩnh viễn
                </Button>
              </Popconfirm>
            </>
          ) : (
            <>
              <Popconfirm
                title="Xóa mềm size"
                description="Bạn có chắc chắn muốn xóa mềm size này?"
                onConfirm={() => mutationSoftDelete.mutate(size._id)}
                okText="Có"
                cancelText="Không"
              >
                <Button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all">
                  Xóa
                </Button>
              </Popconfirm>
              <Link to={`/admin/size/${size._id}/update`}>
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

  if (isLoading) {
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
  const subcategories = categoriesData?.data?.filter(
    (category: Category) => category.parent_id !== null
  );
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <div>
      {contextHolder}
      <div className="flex items-center justify-between mb-5">
        <Title level={3}>Danh sách size</Title>

        <div className="flex space-x-3">
          <Search
            placeholder="Tìm kiếm size"
            onSearch={handleSearch}
            allowClear
            style={{ width: 300 }}
          />
          <Select
            value={selectedCategory}
            onChange={(value) => setSelectedCategory(value)}
            style={{ width: 150 }}
            placeholder="Chọn danh mục"
            options={[
              { label: "Tất cả", value: "allCategory" },
              ...(subcategories?.map((subcategories: Category) => ({
                label: subcategories.title,
                value: subcategories._id,
              })) || []),
            ]}
          />
          <Button
            type="primary"
            icon={<DeleteOutlined />}
            onClick={() => setIsDelete(!isDelete)}
          >
            {isDelete ? "" : ""}
          </Button>
          <Button type="primary" icon={<PlusCircleFilled />}>
            <Link to="/admin/size/add" style={{ color: "white" }}>
              Thêm size
            </Link>
          </Button>
        </div>
      </div>

      <Table
        dataSource={sizes?.data}
        columns={columns}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: sizes?.pagination?.totalItems || 0,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          onChange: (page, pageSize) => {
            setCurrentPage(page);
            setPageSize(pageSize);
          },
        }}
        scroll={{ y: 300 }} // Chỉ cần chiều cao
        style={{ tableLayout: "fixed" }} // Giữ chiều rộng ổn định
      />

      <Modal
        title="Chi tiết size"
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={800}
      >
        {selectedSize && (
          <div className="p-5">
            <Descriptions
              bordered
              column={2}
              className="bg-gray-50 rounded-lg shadow-sm border border-gray-200"
            >
              <Descriptions.Item label="Tên size" span={2}>
                <span className="font-semibold text-lg text-gray-900">
                  {selectedSize.name}
                </span>
              </Descriptions.Item>

              <Descriptions.Item label="Giá size" span={2}>
                <span className="font-semibold text-lg text-gray-900">
                  {selectedSize.priceSize}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SizeManagerPage;
