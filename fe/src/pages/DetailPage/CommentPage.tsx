import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import instance from '../../services/api';
import CommentDetail from './CommentDetail';
import { Button } from "antd";
import { Comment } from '../../types/comment';
import { Product } from '../../types/product';

const CommentPage = () => {
  const { id } = useParams<{ id: string }>();
  const [replies, setReplies] = useState<Comment[]>([]);
  const [showReplies, setShowReplies] = useState<string | null>(null);

  // Fetch sản phẩm
  const {
    data: product,
    isLoading: isProductLoading,
    error: productError,
  } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await instance.get(`/products/${id}`);
      return response.data.data;
    },
    enabled: !!id, // Chỉ thực thi khi `id` có giá trị
  });

  // Fetch bình luận
  const {
    data: comments = [],
    refetch: refetchComments,
    isLoading: isCommentsLoading,
  } = useQuery<Comment[]>({
    queryKey: ["comments", id],
    queryFn: async () => {
      const response = await instance.get(`/comment/product/${id}`);
      return response.data;
    },
    enabled: !!id, // Chỉ thực thi khi `id` có giá trị
    refetchInterval: 800, // Tự động tải lại dữ liệu sau mỗi 800ms
  });
  

  // Fetch phản hồi
  const fetchReplies = async (parentId: string) => {
    const response = await instance.get(`/comment/parent/${parentId}`);
    return response.data;
  };

  const handleToggleReplies = async (parentId: string) => {
    if (showReplies === parentId) {
      setShowReplies(null);
    } else {
      const fetchedReplies = await fetchReplies(parentId);
      setReplies(fetchedReplies);
      setShowReplies(parentId);
    }
  };

  // Xử lý trạng thái tải hoặc lỗi
  if (isProductLoading) return <div className="text-center mt-10 text-gray-600">Đang tải sản phẩm...</div>;
  if (productError) return <div className="text-center mt-10 text-red-500">Lỗi tải sản phẩm: {productError.message}</div>;
  if (!product) return <div className="text-center mt-10 text-red-500">Không tìm thấy sản phẩm</div>;

  return (
    <div className="p-6 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen mt-[100px]">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover"
          />
          <div className="absolute bottom-0 bg-black bg-opacity-70 text-white p-4 w-full">
            <h1 className="text-4xl font-bold">{product.name}</h1>
            <p className="text-lg text-orange-300 font-semibold">{product.price.toLocaleString()} VNĐ</p>
          </div>
        </div>

        {/* Thông tin sản phẩm */}
        <div className="p-6">
          <p className="text-gray-700 text-base leading-relaxed">{product.description}</p>
        </div>

        {/* Đánh giá và bình luận */}
        <h1 className="text-2xl font-bold text-gray-800 p-6">Nội dung đánh giá</h1>
        <div className="p-6 bg-gray-100 border-t space-y-6 max-h-[430px] overflow-auto">
          {isCommentsLoading ? (
            <div className="text-center text-gray-600">Đang tải bình luận...</div>
          ) : comments.length > 0 ? (
            comments.map((review: Comment) => (
              <div key={review._id} className="flex space-x-4 items-start border-b pb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <p className="font-bold">{review.user_id.userName}</p>
                  <p className="text-gray-500 text-sm">
                    Ngày bình luận: {new Date(review.createdAt).toLocaleString("vi-VN", {
                      dateStyle: "short",
                      timeStyle: "short",
                      timeZone: "Asia/Ho_Chi_Minh",
                    })}
                  </p>
                  <p className="mt-2 text-sm">{review.content}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {review.image?.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`image-${idx}`}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ))}
                  </div>

                  {/* Phản hồi */}
                  {showReplies === review._id && (
                    <div className="mt-4 pl-6">
                      {replies.map(reply => (
                        <div key={reply._id} className="flex items-start space-x-4">
                          <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                          <div className="flex-1">
                            <p className="font-semibold">{reply.user_id.userName}</p>
                            <p className="text-sm">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Hiển thị/ẩn phản hồi */}
                  <Button
                    type="link"
                    onClick={() => handleToggleReplies(review._id)}
                    className="text-blue-500"
                  >
                    {showReplies === review._id ? "Ẩn phản hồi" : "Xem phản hồi"}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">Chưa có bình luận nào.</div>
          )}
        </div>

        <CommentDetail />
      </div>
    </div>
  );
};

export default CommentPage;
