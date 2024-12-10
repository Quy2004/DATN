import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import instance from "../services/api";
import { Post } from "../types/post";
import { CategoryPost } from "../types/categoryPost";

const Homes: React.FC = () => {
  const {
    data: posts,
    isLoading,
    isError,
    error,
  } = useQuery<{ data: Post[] }>({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        const response = await instance.get("posts");
        return response.data;
      } catch (error) {
        throw new Error("Lỗi khi tải danh sách bài viết");
      }
    },
  });

  const {
    data: categoryPost,
    isLoading: isLoadingCategory,
    isError: isErrorCategory,
    error: errorCategory,
  } = useQuery<{ data: CategoryPost[] }>({
    queryKey: ["categoryPost"],
    queryFn: async () => {
      const response = await instance.get("categoryPost");
      return response.data;
    },
  });

  // Nhóm bài viết theo danh mục
  const postsByCategory = useMemo(() => {
    if (!posts?.data || !categoryPost?.data) return {};

    return categoryPost.data.reduce((acc, category) => {
      acc[category._id] = posts.data.filter(
        (post) => post.categoryPost?._id === category._id
      );
      return acc;
    }, {} as Record<string, Post[]>);
  }, [posts?.data, categoryPost?.data]);

  // Render bài viết theo từng danh mục
  const renderCategoryPosts = (category: CategoryPost) => {
    const categoryPosts = postsByCategory[category._id] || [];

    return (
      <div key={category._id}>
        <h2 className="border-l-[6px] text-left text-2xl font-semibold px-3 py-0.5 mb-5 mt-10 border-l-orange-400">
          {category.title}
        </h2>
        <div className="row grid grid-cols-1 md:grid-cols-3 gap-5">
          {categoryPosts.map((post) => (
            <div key={post._id} className="rounded-[10px] overflow-hidden">
              <ul className="img_homes">
                <li>
                  <Link to={`chuyennha-detail/${post._id}`}>
                    <img
                      src={post.imagePost}
                      alt={post.title}
                      loading="lazy"
                      className="hover:scale-110 ease-in-out duration-300 object-cover w-full h-auto rounded-[10px]"
                    />
                  </Link>
                </li>
              </ul>
              <nav className="mx-3 md:mx-0">
                <p className="my-2 text-left text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
                   <Link to={`chuyennha-detail/${post._id}`}>
                  <h3 className="uppercase truncate text-[17px] font-semibold pb-1">
                    {post.title}
                  </h3>
                </Link>
                <p
                  className="text-[15px] text-gray-700 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: post.excerpt }}
                />
              </nav>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Xử lý trạng thái loading và error
  if (isLoading || isLoadingCategory) return <p>Đang tải...</p>;
  if (isError) return <p>Lỗi: {error.message}</p>;
  if (isErrorCategory) return <p>Lỗi: {errorCategory.message}</p>;

  return (
    <div className="bg-orange-50 md:pt-12 md:pb-36">
      <div className="containerAll mx-auto">
        <div>
          <h1 className="text-3xl text-center md:text-left font-semibold pt-8 md:pt-0">
            Chuyện Nhà
          </h1>
        </div>

        <div className="mx-3 md:mx-0">
          {/* Render các danh mục và bài viết tương ứng */}
          {categoryPost?.data?.map(renderCategoryPosts)}
        </div>
      </div>
    </div>
  );
};

export default Homes;
