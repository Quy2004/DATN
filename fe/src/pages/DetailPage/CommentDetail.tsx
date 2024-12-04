import { FileImageOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Form, Input, message, Upload } from "antd";
import { RcFile } from "antd/es/upload";
import axios from "axios";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import instance from "../../services/api";
import { Comment } from "../../types/comment";

const CommentDetail: React.FC = () => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser!) : {};

  const [form] = Form.useForm();
  const { id } = useParams<{ id: string }>();
  const [messageApi, contextHolder] = message.useMessage();
  const [images, setImages] = useState<string[]>([]); // Lưu danh sách ảnh đã tải lên
  const [replies, setReplies] = useState<Comment[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [filter, setFilter] = useState<number | null>(null);

  const handleFilter = (stars: number | null) => {
    setFilter(stars);
  };

  const { data: comments, refetch } = useQuery({
    queryKey: ["comment", id],
    queryFn: async () => {
      if (!id) throw new Error("Thiếu Product ID");
      const response = await instance.get(`/comment/product/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  // Upload ảnh lên Cloudinary
  const uploadImage = async (file: RcFile) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "duan_totnghiep");

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/duantotnghiep/image/upload",
        formData
      );
      setImages((prev) => [...prev, res.data.secure_url]); // Thêm URL ảnh vào danh sách
      message.success("Ảnh đã được upload thành công!");
    } catch (error) {
      message.error("Upload ảnh thất bại!");
    }
  };

  // Xóa ảnh khỏi danh sách
  const handleRemoveImage = (url: string) => {
    setImages((prev) => prev.filter((image) => image !== url));
    message.info("Ảnh đã được xóa.");
  };

  // Submit bình luận
  const handleSubmit = async (values: Comment) => {
    const commentData = {
      ...values,
      image: images, // Gửi danh sách ảnh
      content: values.content,
      user_id: user._id,
      product_id: id,
    };

    try {
      await instance.post("/comment", commentData); // Gửi dữ liệu tới server
      messageApi.success("Thêm bình luận thành công!");
      form.resetFields();
      setImages([]); // Reset danh sách ảnh
      refetch(); // Cập nhật danh sách bình luận
    } catch (error) {
      messageApi.error("Thêm bình luận thất bại!");
      console.error(error);
    }
  };

  const fetchReplies = async (parentId: string) => {
    const response = await instance.get(`/comment/parent/${parentId}`);
    return response.data;
  };



  const handleToggleReplies = async (parentId: string) => {
    if (!showReplies) {
      const fetchedReplies = await fetchReplies(parentId);
      setReplies(fetchedReplies);
    }
    setShowReplies(!showReplies);
  };

  




  return (
    <div className="bg-white rounded shadow-sm">
      {contextHolder}
      <div className="border-y p-4 md:border">
        <h1 className="font-medium text-xl">Đánh giá sản phẩm</h1>
        <Form form={form} onFinish={handleSubmit} layout="vertical" className="space-y-4">
          {/* Nội dung bình luận */}
          <Form.Item
            name="content"
            rules={[{ required: true, message: "Vui lòng nhập đánh giá của bạn!" }]}
          >
            <Input.TextArea placeholder="Đánh giá của bạn tại đây..." rows={4} allowClear />
          </Form.Item>

          {/* Upload nhiều ảnh */}
          <Form.Item name="images">
            <div className="flex flex-wrap items-center gap-4">
              {/* Hiển thị ảnh đã upload */}
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img src={image} alt={`uploaded-${index}`} className="w-20 h-20 object-cover rounded" />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                    onClick={() => handleRemoveImage(image)}
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Nút tải ảnh */}
              <Upload
                name="file"
                listType="picture-card"
                multiple
                beforeUpload={(file) => {
                  uploadImage(file);
                  return false;
                }}
                showUploadList={false}
                className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 hover:border-gray-400 transition"
              >
                <div className="flex flex-col items-center">
                  <FileImageOutlined className="text-2xl text-gray-500 mb-2" />
                  <span className="text-sm text-gray-500">Tải ảnh lên</span>
                </div>
              </Upload>
            </div>
          </Form.Item>

          {/* Gửi bình luận */}
          <div className="flex justify-end">
            <Form.Item>
              <Button type="primary" htmlType="submit" className="bg-red-500">
                Gửi
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>

      {/* Tổng đánh giá */}
      <div className="border-y mt-2 p-4 md:border">
        <div className="flex items-center space-x-4 mb-6">
          <div>
            <p className="text-3xl font-bold text-red-500">5 trên 5</p>
            <div className="flex text-red-500 text-xl">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i}>★</span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap space-x-2">
            <button onClick={() => handleFilter(null)} className={`px-3 py-1 border ${filter === null ? "bg-red-500 text-white" : "bg-white"}`}>
              Tất Cả
            </button>
            {[5, 4, 3, 2, 1].map((stars) => (
              <button key={stars} onClick={() => handleFilter(stars)} className={`px-3 py-1 border ${filter === stars ? "bg-red-500 text-white" : "bg-white"}`}>
                {stars} Sao ({comments?.filter((r:any) => r.rating === stars).length})
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách đánh giá */}
        <div className="space-y-6">
          {comments?.map((review: Comment) => (
            
            <div key={review._id} className="flex space-x-4 items-start border-b pb-4">
              <div className="w-10 h-10 rounded-full bg-gray-200"></div>
              <div className="flex-1">
                <p className="font-bold">{review.user_id.userName}</p>
                <p className="text-gray-500 text-sm">
                  Ngày bình luận: {new Date(review.createdAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" })}
                </p>
                <p className="mt-2 text-sm">{review.content}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {review.image?.map((img, idx) => (
                    <img key={idx} src={img} alt="review-img" className="w-24 h-24 object-cover rounded-md" />
                  ))}
                </div>
				<div className="mt-3 flex gap-2">
                  <Button type="link" onClick={() => handleToggleReplies(review._id)}>Xem phản hồi</Button>
                </div>
                {showReplies && typeof replies[0]?.parent_id === 'string' && review._id === replies[0].parent_id && (

                  <div className="mt-2 space-y-4">
                    {replies.map((reply) => (
                      <div key={reply._id} className="flex space-x-4 items-start border-b pb-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                        <div className="flex-1">
                          <p className="font-bold">{reply.user_id?.userName}</p>
                          <p>{reply.content}</p>
                        </div>
                      </div>
                    ))}
                    
                  </div>
                )}

				
				</div>
              </div>
			
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommentDetail;
