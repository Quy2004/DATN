import { BackwardFilled } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Form, FormProps, Input, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import instance from "../../../services/api";

type FieldType = {
  name?: string;
};

const SizeAddPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [form] = Form.useForm();



  // Mutation để thêm size
  const { mutate} = useMutation({
    mutationFn: async (size: FieldType) => {
      return await instance.post(`/sizes`, size);
    },
    onSuccess: () => {
      messageApi.success("Thêm size thành công");
      // Reset form sau khi thêm thành công
      form.resetFields();
      // Chuyển hướng về trang quản lý size
      setTimeout(() => {
        navigate("/admin/size");
      }, 2000);
    },
    onError(error: any) {
      messageApi.error(`Lỗi: ${error.message}`);
    },
  });

  // Xử lý khi submit form
  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    console.log("Success:", values);
    mutate(values);
  };



  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-semibold text-2xl">Thêm size mới</h1>
        <Button type="primary">
          <Link to="/admin/size">
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
            label="Tên size"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên size!" }]}
          >
            <Input />
          </Form.Item>

          

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Thêm size
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default SizeAddPage;
