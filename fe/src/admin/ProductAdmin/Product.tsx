import React from "react";
import {
  Table,
  Space,
  Button,
  message,
  Popconfirm,
  Image,
  Spin,
  Alert,
} from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import instance from "../../services/api";
import { PlusCircleFilled } from "@ant-design/icons";
import { Link } from "react-router-dom";
import Title from "antd/es/typography/Title";

type Category = {
  _id: string;
  title: string;
  parent_id: string | null;
};

type Size = {
  _id: string;
  name: string;
  priceSize?: number;
};

type Topping = {
  _id: string;
  nameTopping: string;
};

type Product = {
  _id: string;
  name: string;
  image: string;
  category_id: Array<Category>;
  product_sizes: Array<{
    size_id: Size;
    price: number;
    stock: number;
  }>;
  product_toppings: Array<{
    topping_id: Topping;
    price: number;
  }>;
  stock: number;
  status: string;
};

const ProductManagerPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await instance.get("products");
      return response.data.data;
    },
  });

  const columns = [
    {
      title: "STT",
      key: "key",
      render: (text: string, record: any, index: number) => index + 1, // STT bắt đầu từ 1
    },

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
      title: "Kích thước",
      dataIndex: "product_sizes",
      key: "size",
      render: (sizes: Array<{ size_id: Size }>) => {
        const sizeNames = sizes
          .map((sizeObj) => sizeObj.size_id.name)
          .join(", ");
        return <span>{sizeNames}</span>;
      },
    },
    {
      title: "Topping",
      dataIndex: "product_toppings",
      key: "topping",
      render: (toppings: Array<{ topping_id: Topping }>) => {
        const toppingNames = toppings
          .map(
            (toppingObj) =>
              toppingObj.topping_id?.nameTopping || "Không có topping"
          )
          .join(", ");
        return <span>{toppingNames}</span>;
      },
    },
    {
      title: "Tồn kho",
      dataIndex: "stock",
      key: "stock",
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

  return (
    <div>
      {contextHolder}
      <div className="flex items-center justify-between mb-5">
        <Title level={3}>Quản lý sản phẩm</Title>
        <Button type="primary" icon={<PlusCircleFilled />}>
          <Link to="/admin/product/add" style={{ color: "white" }}>
            Thêm sản phẩm
          </Link>
        </Button>
      </div>

      <Table columns={columns} dataSource={products} rowKey="_id" />
    </div>
  );
};

export default ProductManagerPage;
