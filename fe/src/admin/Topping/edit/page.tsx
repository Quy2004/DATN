import { BackwardFilled } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, InputNumber, message, Select, Spin } from "antd";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import instance from "../../../services/api";

type FieldType = {
  nameTopping: string;
  priceTopping?: number;
  statusTopping: string;
};

const ToppingUpdatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Truy vấn để lấy dữ liệu Topping hiện tại
  const { data: toppingData, isLoading: isToppingLoading } = useQuery({
    queryKey: ["toppings", id],
    queryFn: async () => {
      const response = await instance.get(`/toppings/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (toppingData) {
      form.setFieldsValue({
        nameTopping: toppingData.nameTopping,
        priceTopping: toppingData.priceTopping,
        statusTopping: toppingData.statusTopping,
      });
    }
  }, [toppingData, form]);

  const { mutate } = useMutation({
    mutationFn: async (topping: FieldType) => {
      return await instance.put(`/toppings/${id}`, topping);
    },
    onSuccess: () => {
      messageApi.success("Cập nhật Topping thành công");
      queryClient.invalidateQueries({ queryKey: ["toppings", id] });
      setTimeout(() => {
        navigate("/admin/topping");
      }, 2000);
    },
    onError(error) {
      messageApi.error(`Lỗi: ${error.message}`);
    },
  });

  const onFinish = (values: FieldType) => {
    mutate(values);
  };

  if (isToppingLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-semibold text-2xl">Cập nhật Topping</h1>
        <Button type="primary">
          <Link to="/admin/topping">
            <BackwardFilled /> Quay lại
          </Link>
        </Button>
      </div>
      <div className="max-w-3xl mx-auto">
        {contextHolder}
        <Form
          form={form}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            label="Tên Topping"
            name="nameTopping"
            rules={[{ required: true, message: "Vui lòng nhập tên Topping!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label="Giá Topping"
            name="priceTopping"
            rules={[{ required: true, message: "Vui lòng giá của Topping!" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="statusTopping"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select>
              <Select.Option value="available">Có sẵn</Select.Option>
              <Select.Option value="unavailable">Hết hàng</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Cập nhật Topping
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default ToppingUpdatePage;
