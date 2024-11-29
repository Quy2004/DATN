import React, { useState, useEffect } from "react";
import { Form, Input, Button, Upload, message, Select } from "antd";
import { BackwardFilled, FileImageOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import instance from "../../../services/api";
import { RcFile, UploadProps } from "antd/es/upload";
import axios from "axios";
import { Post } from "../../../types/post";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CategoryPost } from "../../../types/categoryPost";
import ReactQuill from "react-quill";

type PostType = {
  title: string;
  categoryPost: CategoryPost;
  excerpt: string;
  imagePost: string;
  galleryPost: string[];
  content: string;
};

const PostUpdatePage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Post ID from URL
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [, setUploading] = useState<boolean>(false);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const { data: categoryPost, isLoading: isLoadingCategoryPost } = useQuery({
    queryKey: ["categoryPost"],
    queryFn: async () => {
      const response = await instance.get("/categoryPost");
      return response.data;
    },
  });
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await instance.get(`/posts/${id}`);
        const postData = res.data.data;
        form.setFieldsValue({
          title: postData.title,
          excerpt: postData.excerpt,
          categoryPost: postData.categoryPost.title,
          content: postData.content,
        });
        setImageUrl(postData.imagePost);
        setGalleryUrls(postData.galleryPost || []);
      } catch (error) {
        message.error("Không thể tải thông tin bài viết.");
      }
    };
    fetchPost();
  }, [id, form]);

  const { mutate } = useMutation<void, Error, PostType>({
    mutationFn: async (post: PostType) => {
      return await instance.put(`/posts/${id}`, post);
    },
    onSuccess: () => {
      message.success("Cập nhật bài viết thành công");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setTimeout(() => {
        navigate("/admin/post");
      }, 2000);
      setImageUrl("");
    },
    onError: (error) => {
      message.error(`Lỗi: ${error.message}`);
    },
  });

  const uploadImage = async (file: RcFile): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "duan_totnghiep");

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/duantotnghiep/image/upload",
        formData
      );
      return res.data.secure_url;
    } catch (error) {
      message.error("Upload ảnh thất bại!");
      throw error;
    }
  };

  const handleUpload: UploadProps["customRequest"] = async ({
    file,
    onSuccess,
    onError,
  }) => {
    setUploading(true);
    try {
      const uploadedUrl = await uploadImage(file as RcFile);
      setImageUrl(uploadedUrl);
      onSuccess && onSuccess("ok");
    } catch (error) {
      onError && onError(error as Error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    message.info("Ảnh đã được xóa. Vui lòng upload ảnh mới.");
  };
  const handleGalleryUpload: UploadProps["customRequest"] = async ({
    file,
    onSuccess,
    onError,
  }) => {
    setUploading(true);
    try {
      const uploadedUrl = await uploadImage(file as RcFile);
      setGalleryUrls((prev) => [...prev, uploadedUrl]);
      onSuccess && onSuccess("ok");
    } catch (error) {
      onError && onError(error as Error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveGalleryImage = (removedUrl: string) => {
    setGalleryUrls((prev) => prev.filter((url) => url !== removedUrl));
    message.info("Ảnh trong gallery đã được xóa.");
  };
  const onFinish = async (values: Post) => {
    if (!imageUrl) {
      message.error("Vui lòng upload ảnh trước khi cập nhật bài viết!");
      return;
    }
    const updatedPost: PostType = {
      title: values.title,
      categoryPost: values.categoryPost,
      imagePost: imageUrl,
      galleryPost: galleryUrls,
      content: values.content,
      excerpt: values.excerpt,
    };
    mutate(updatedPost);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-semibold text-2xl">Cập nhật bài viết</h1>
        <Link to="/admin/post">
          <Button
            className="flex items-center justify-center bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-md transition duration-300 ease-in-out"
            type="primary"
          >
            <BackwardFilled /> Quay lại
          </Button>
        </Link>
      </div>
      <div className="max-w-3xl mx-auto max-h-[450px] overflow-y-auto">
        <Form
          form={form}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          onFinish={onFinish}
        >
          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[
              { required: true, message: "Vui lòng nhập tiêu đề" },
              { min: 5, message: "Tiêu đề phải có ít nhất 5 ký tự" },
            ]}
          >
            <Input
              className="Input-antd text-sm placeholder-gray-400"
              placeholder="Nhập tiêu đề"
            />
          </Form.Item>

          <Form.Item
            label="Danh mục"
            name="categoryPost"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select
              placeholder="Chọn danh mục"
              loading={isLoadingCategoryPost}
              disabled={isLoadingCategoryPost}
            >
              {categoryPost?.data?.map((category: CategoryPost) => (
                <Select.Option key={category._id} value={category._id}>
                  {category.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
         
          <Form.Item
            label="Ảnh bài viết"
            name="imagePost"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
          >
            <Upload
              name="file"
              listType="picture-card"
              customRequest={handleUpload}
              onRemove={handleRemoveImage}
              maxCount={1}
              fileList={
                imageUrl
                  ? [
                      {
                        uid: "1",
                        name: "image.png",
                        status: "done",
                        url: imageUrl,
                      },
                    ]
                  : []
              } // Thiết lập fileList
            >
              <Button icon={<FileImageOutlined />}></Button>
            </Upload>
            {imageUrl && (
              <img src={imageUrl} alt="post" className="w-[200px] mt-2.5" />
            )}
          </Form.Item>
          <Form.Item label="Ảnh phụ" name="galleryPost">
            <Upload
              name="file"
              listType="picture-card"
              customRequest={handleGalleryUpload}
              multiple
              fileList={galleryUrls.map((url, index) => ({
                uid: index.toString(),
                name: `image-${index}.png`,
                status: "done",
                url: url,
              }))}
              onRemove={(file) => handleRemoveGalleryImage(file.url || "")}
            >
              <Button icon={<FileImageOutlined />}></Button>
            </Upload>
          </Form.Item>

          {/* Hiển thị ảnh phụ đã tải lên */}

          <Form.Item
            label="Đoạn trích"
            name="excerpt"
            rules={[{ required: true, message: "Vui lòng nhập đoạn trích" }]}
            className="mt-5"
          >
            <ReactQuill theme="snow" placeholder="Nhập đoạn trích" />
          </Form.Item>

          <Form.Item
            label="Nội dung chính"
            name="content"
            rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
            className="mt-5"
          >
            <ReactQuill theme="snow" placeholder="Nhập nội dung chính" />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default PostUpdatePage;
