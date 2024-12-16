import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";
import instance from "../../../services/api";
import { useQuery } from "@tanstack/react-query";
import { Post } from "../../../types/post";

const CoffeHolicTab: React.FC = () => {
  const { categoryId } = useParams();

  const {
    data: posts = [],
    isLoading,
    isError,
    error,
  } = useQuery({
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

  const filteredPosts = useMemo(() => {
    return categoryId
      ? posts.data?.filter(
        (post: Post) =>
          post.categoryPost?._id === categoryId && !post.isDeleted
      )
      : posts.data?.filter((post: Post) => !post.isDeleted);
  }, [posts.data, categoryId]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading data: {error?.message}</div>;

  return (
    <div className="mb-10 md:mb-14 container mx-auto px-4">
      {filteredPosts?.map((post: Post) => (
        <div
          key={post._id}
          className="flex flex-col md:flex-row items-center justify-center py-0 md:pb-4 border-b last:border-b-0"
        >
          <div className="w-full md:w-1/4 mb-2 md:mb-0 md:mr-5">
            <Link to={`/chuyennha-detail/${post._id}`} className="rounded-2xl">
              <img
                src={post.imagePost}
                alt={post.title}
                className=" h-[160px] rounded-2xl w-full object-cover shadow-md hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>
          <div className="w-full md:w-1/2 text-left md:text-justify">
            <Link to={`/chuyennha-detail/${post._id}`}>
              <h3 className="uppercase text-sm md:text-lg font-semibold pb-1 hover:text-orange-500 transition-colors">
                {post.title}
              </h3>
            </Link>
            <div className="flex items-center space-x-4 mb-2">
              <time className="text-xs md:text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleDateString()}
              </time>
            </div>
            <p
              className="text-gray-600 line-clamp-3 text-xs md:mb-0 mb-4 md:text-sm"
              dangerouslySetInnerHTML={{ __html: post.excerpt }}
            >
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CoffeHolicTab;
