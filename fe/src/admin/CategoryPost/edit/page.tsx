import { BackwardFilled, FileImageOutlined } from "@ant-design/icons";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { Button, Form, Input, message } from "antd";
import { RcFile, UploadFile } from "antd/es/upload";
import Upload from "antd/es/upload/Upload";
import axios from "axios";
import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import { Link, useNavigate, useParams } from "react-router-dom";
import instance from "../../../services/api";
import { CategoryPost } from "../../../types/categoryPost";

const queryClient = new QueryClient(); // Tạo instance của QueryClient

const CategoryPostUpdatePage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { id } = useParams<{ id: string }>();
  const [image, setImage] = useState<string>("");
  const [thumbnailFileList, setThumbnailFileList] = useState<UploadFile[]>([]);
  const [thumbnail, setThumbnail] = useState<string>(""); // Sửa từ mảng thành chuỗi
  const { data: categoryPost, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const response = await instance.get(`/categoryPost/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (categoryPost) {
      form.setFieldsValue({
        title: categoryPost.title,
        description: categoryPost.description,
      });
      setImage(categoryPost.image);
      setThumbnail(categoryPost.thumbnail); // Gán thumbnail từ categoryPost
      setThumbnailFileList([
        {
          uid: "0",
          name: "thumbnail.jpg",
          status: "done",
          url: categoryPost.thumbnail,
        },
      ]);
    }
  }, [categoryPost, form]);

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
      }
    } catch (error) {
      message.error("Upload ảnh thất bại!");
    }
  };

  const handleThumbnailChange = ({ fileList }: { fileList: UploadFile[] }) => {
    if (fileList.length > 0) {
      // Nếu có ảnh mới, thay thế ảnh cũ
      const newThumbnail = fileList[0].url
        ? fileList[0].url
        : URL.createObjectURL(fileList[0].originFileObj!);
      setThumbnail(newThumbnail); // Cập nhật thumbnail thành chuỗi
    }
    setThumbnailFileList(fileList);
  };

  const mutation = useMutation({
    mutationFn: async (values: CategoryPost) => {
      const productData = {
        ...values,
        // thumbnail: thumbnail, // Sử dụng thumbnail kiểu chuỗi
      };

      // Gửi yêu cầu cập nhật sản phẩm
      await instance.put(`/categoryPost/${id}`, productData);
    },
    onSuccess: () => {
      message.success("Cập nhật sản phẩm thành công!");
      queryClient.invalidateQueries({ queryKey: ["categoryPost"] });
      setTimeout(() => {
        navigate(`/admin/categoryPost`);
      }, 2000);
    },
    onError: (error) =>
      message.error(
        error instanceof Error ? error.message : "Cập nhật sản phẩm thất bại!"
      ),
  });

  const onFinish = (values: CategoryPost) => {
    mutation.mutate(values); // Gọi hàm mutate với giá trị từ form
  };

  return (
    <>
      {contextHolder}
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-semibold text-2xl">Cập nhật bài viết</h1>
        <Button type="primary">
          <Link to="/admin/categoryPost">
            <BackwardFilled /> Quay lại
          </Link>
        </Button>
      </div>

      <div className="max-w-3xl mx-auto max-h-[450px] overflow-y-auto">
        <Form
          form={form}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item<CategoryPost>
            label="Tên danh mục"
            name="title"
            required
            rules={[
              {
                validator: async (_, value) => {
                  if (!value) {
                    return Promise.reject(
                      new Error("Vui lòng nhập tên danh mục!")
                    );
                  }
                  const trimmedValue = value.trim();
                  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>[\]\\/_+=-]/;

                  if (hasSpecialChar.test(trimmedValue)) {
                    return Promise.reject(
                      new Error("Tên danh mục không được chứa ký tự đặc biệt!")
                    );
                  }
                  // Kiểm tra danh mục đã tồn tại
                  const response = await instance.get(
                    `/categoryPost?title=${trimmedValue}`
                  );
                  const existingCategoryPost = response.data.data.find(
                    (categoryPost: CategoryPost) =>
                      categoryPost.title.toLowerCase() ===
                      trimmedValue.toLowerCase()
                  );
                  if (existingCategoryPost) {
                    return Promise.reject(
                      new Error(
                        "Tên danh mục đã tồn tại. Vui lòng chọn tên khác!"
                      )
                    );
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              className="Input-antd text-sm placeholder-gray-400"
              placeholder="Nhập tên danh mục"
            />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
            <Button
              htmlType="reset"
              className="bg-gray-300 text-gray-800 rounded-md px-4 py-2 hover:bg-gray-400 transition ml-2"
            >
              Làm mới
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default CategoryPostUpdatePage;
