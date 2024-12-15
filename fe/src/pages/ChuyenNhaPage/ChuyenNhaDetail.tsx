import React from "react";
import { Link, useParams } from "react-router-dom";
import instance from "../../services/api";
import { useQuery } from "@tanstack/react-query";
import { Post } from "../../types/post";

const ChuyenNhaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch post and related posts using React Query
  const {
    data: postData,
    isLoading,
    isError,
    error,
  } = useQuery<Post>({
    queryKey: ["postDetail", id],
    queryFn: async () => {
      try {
        const response = await instance.get(`posts/${id}`);
        return response.data.data;
      } catch (error) {
        throw new Error("Lỗi khi tải bài viết");
      }
    },
  });

  const {
    data: relatedPosts,
    isLoading: isRelatedLoading,
    isError: isRelatedError,
    error: relatedError,
  } = useQuery<Post>({
    queryKey: ["relatedPosts", id],
    queryFn: async () => {
      try {
        const response = await instance.get(`posts/${id}/related`);
        return response.data;
      } catch (error) {
        throw new Error("Lỗi khi tải bài viết");
      }
    },
  });

  console.log("Post Data:", postData);
  console.log("Related Posts:", relatedPosts);


  if (isLoading || isRelatedLoading) return <div>Loading...</div>;
  if (isError || isRelatedError || relatedError) {
    return (
      <div>
        Error: {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }

  if (!postData) return <div>Bài viết không tồn tại</div>;

  const  post  = postData;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6 sm:mb-8 text-sm text-gray-600 mt-16">
        <a href="/" className="hover:text-brown-600 text-gray-700 font-medium">
          Trang chủ
        </a>
        <span className="mx-2">/</span>
        <div className="flex space-x-2">
          {post.categoryPost ? (
            <span className="text-gray-700 font-medium">
              {post.categoryPost.title}
            </span>
          ) : (
            <span className="text-gray-500">Danh mục không tồn tại</span>
          )}
        </div>
      </nav>

      {/* Article Header */}
      <article className="prose prose-sm sm:prose lg:prose-xl max-w-none">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Meta info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 space-y-2 sm:space-y-0">
            <div className="line-clamp-3">
              <span
                dangerouslySetInnerHTML={{
                  __html: post.excerpt,
                }}
              />
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="-mx-4 sm:mx-0 mb-6 sm:mb-8 sm:rounded-lg overflow-hidden">
          <img
            src={post.imagePost}
            alt={post.title}
            className="w-full h-[200px] sm:h-[300px] md:h-[400px] object-cover"
          />
        </div>

        {/* Content */}
        <div className="text-gray-800 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* Share Buttons */}
        <div className="border-t border-gray-200 pt-6 sm:pt-8">
          <h3 className="text-lg font-semibold mb-3 sm:mb-4">
            Chia sẻ bài viết:
          </h3>
          <div className="flex space-x-3">
            <button className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700">
              <FacebookIcon className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full bg-blue-400 text-white hover:bg-blue-500">
              <TwitterIcon className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full bg-green-600 text-white hover:bg-green-700">
              <LinkedInIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      <div className="mt-8 sm:mt-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
          Bài viết liên quan
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {relatedPosts?.data.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">
              Không có bài viết liên quan.
            </p>
          ) : (
            relatedPosts?.data.map((relatedPost: Post) => (
              <div
                key={relatedPost._id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <Link to={`/chuyennha-detail/${relatedPost._id}`}>
                    <img
                      src={relatedPost.imagePost || "/placeholder-image.jpg"} // Thêm hình ảnh mặc định nếu không có
                      alt={relatedPost.title}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </Link>
                </div>
                <div className="py-2 md:p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    <Link
                      to={`/chuyennha-detail/${relatedPost._id}`}
                      className="hover:underline"
                    >
                      {relatedPost.title}
                    </Link>
                  </h3>
                  <p
                    className="text-sm text-gray-600 line-clamp-2"
                    dangerouslySetInnerHTML={{
                      __html:
                      relatedPost.excerpt || "Nội dung tóm tắt không có.",
                    }}
                  ></p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Icon Components giữ nguyên như cũ
const FacebookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
  </svg>
);

const TwitterIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.18-7.1-2-9.32-4.75-.39.67-.6 1.45-.6 2.3 0 1.58.81 2.97 2.04 3.79-.73-.02-1.44-.22-2.06-.57v.05c0 2.21 1.57 4.04 3.64 4.45-.38.1-.78.15-1.2.15-.29 0-.57-.03-.84-.08.58 1.81 2.26 3.13 4.24 3.13 5.08 0 8.5-4.13 8.5-7.72 0-.11 0-.22-.01-.33A6.06 6.06 0 0 0 24 5.18l-.01-.35z" />
  </svg>
);

const LinkedInIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M4.98 3.5C4.98 2.67 5.65 2 6.5 2s1.52.67 1.52 1.5S7.35 5 6.5 5s-1.52-.67-1.52-1.5zm.01 3.17h2.9v12h-2.9V8.67zM18 8.67h-2.9v1.22h-.04c-.41-.78-1.42-1.27-2.53-1.27-2.7 0-3.21 1.79-3.21 4.13v5.12h-2.9V8.67h-2.9V19h2.9V8.67h2.9v2.31h.04c.41-.78 1.42-1.27 2.53-1.27 2.7 0 3.21 1.79 3.21 4.13v5.12h2.9V8.67z" />
  </svg>
);

export default ChuyenNhaDetail;