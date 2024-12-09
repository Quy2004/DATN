import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import instance from "../../../services/api";
import { Alert, Spin } from "antd";
import { useMemo } from "react";

interface CategoryPost {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface Post {
  _id: string;
  title: string;
  excerpt: string;
  imagePost: string;
  createdAt: string;
  categoryPost: CategoryPost;
}

interface PostResponse {
  data: Post[];
}

interface CategoryPostResponse {
  data: CategoryPost[];
}

interface PostsByCategoryMap {
  [key: string]: Post[];
}

const AllHomes: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const {
    data: posts = { data: [] } as PostResponse,
    isLoading,
    isError,
  } = useQuery<PostResponse>({
    queryKey: ["posts"],
    queryFn: async () => {
      const response = await instance.get<PostResponse>("posts");
      return response.data;
    },
  });

  const {
    data: categoryPost = { data: [] } as CategoryPostResponse,
    isLoading: isLoadingCategory,
    isError: isErrorCategory,
  } = useQuery<CategoryPostResponse>({
    queryKey: ["categoryPost"],
    queryFn: async () => {
      const response = await instance.get<CategoryPostResponse>("categoryPost");
      return response.data;
    },
  });

  const postsByCategory = useMemo<PostsByCategoryMap>(() => {
    if (!posts.data || !categoryPost.data) return {};

    return categoryPost.data.reduce<PostsByCategoryMap>((acc, category) => {
      acc[category._id] = posts.data.filter(
        (post) => post.categoryPost._id === category._id
      );
      return acc;
    }, {});
  }, [posts.data, categoryPost.data]);

  const renderPost = (post: Post) => (
    <div key={post._id} className="grid grid-cols-3 rounded-[10px] py-3">
      <div className="col-span-1">
        <Link to={`/chuyennha-detail/${post._id}`}>
          <img
            src={post.imagePost}
            alt={post.title}
            className="rounded-xl h-[160px] w-full object-cover"
          />
        </Link>
      </div>
      <div className="col-span-2 px-5 text-justify w-3/4">
        <Link to={`/chuyennha-detail/${post._id}`}>
          <h3 className="uppercase text-lg font-semibold pb-1">{post.title}</h3>
        </Link>
        <p className="my-1 text-gray-500">
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
        <p
          className="text-[15px] line-clamp-2"
          dangerouslySetInnerHTML={{ __html: post.excerpt }}
        ></p>
      </div>
    </div>
  );

  const renderCategoryPosts = (category: CategoryPost) => {
    const categoryPosts = postsByCategory[category._id] || [];
    if (categoryPosts.length === 0)
      return <div>Không có bài viết nào cho danh mục này.</div>;

    return <div>{categoryPosts.map(renderPost)}</div>;
  };

  if (isLoading || isLoadingCategory) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (isError || isErrorCategory) {
    return (
      <div style={{ margin: "20px 0" }}>
        <Alert message="Lỗi khi tải danh sách bài viết" type="error" showIcon />
      </div>
    );
  }

  const limitedPosts = posts?.data.slice(0, 2);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4">
            {limitedPosts.slice(0, 1).map((post: Post) => (
              <div
                key={post._id}
                className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300"
              >
                <Link
                  to={`/chuyennha-detail/${post._id}`}
                  className="block overflow-hidden rounded-t-2xl"
                >
                  <img
                    src={post.imagePost}
                    alt={post.title}
                    className="w-full h-[280px] md:h-[400px] object-cover transform transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                <div className="p-5">
                  <Link to={`/chuyennha-detail/${post._id}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                  <div className="flex items-center space-x-4 mb-3">
                    <time className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </time>
                    <span className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                      {post.categoryPost.title}
                    </span>
                  </div>
                  <p
                    className="text-gray-600 line-clamp-3 text-sm"
                    dangerouslySetInnerHTML={{ __html: post.excerpt }}
                  ></p>
                </div>
              </div>
            ))}
          </div>

          <div className="md:col-span-8">
            {limitedPosts.slice(1, 2).map((post: Post) => (
              <div
                key={post._id}
                className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300"
              >
                <Link
                  to={`/chuyennha-detail/${post._id}`}
                  className="block overflow-hidden rounded-t-2xl"
                >
                  <img
                    src={post.imagePost}
                    alt={post.title}
                    className="w-full h-[300px] md:h-[500px] object-cover transform transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                <div className="p-6">
                  <Link to={`/chuyennha-detail/${post._id}`}>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h2>
                  </Link>
                  <div className="flex items-center space-x-4 mb-4">
                    <time className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </time>
                    <span className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                      {post.categoryPost.title}
                    </span>
                  </div>
                  <p
                    className="text-gray-600 line-clamp-4 text-base"
                    dangerouslySetInnerHTML={{ __html: post.excerpt }}
                  ></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {limitedPosts.slice(2).map((post: Post) => (
            <div
              key={post._id}
              className="group bg-white shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Link
                to={`/chuyennha-detail/${post._id}`}
                className="block overflow-hidden rounded-t-2xl"
              >
                <img
                  src={post.imagePost}
                  alt={post.title}
                  className="w-full h-[200px] sm:h-[240px] lg:h-[260px] object-cover transform transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
              <div className="p-5">
                <Link to={`/chuyennha-detail/${post._id}`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                </Link>
                <div className="flex items-center justify-between mb-3">
                  <time className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </time>
                  <span className="text-xs px-3 py-1 bg-amber-50 text-amber-600 rounded-full">
                    CoffeeHolic
                  </span>
                </div>
                <p
                  className="text-gray-600 line-clamp-3 text-sm"
                  dangerouslySetInnerHTML={{ __html: post.excerpt }}
                ></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="relative -mt-20">
                <Link
                  to=""
                  className="block overflow-hidden shadow-lg"
                >
                  <img
                    src="https://file.hstatic.net/1000075078/file/photo_2021-11-25_09-31-52_52c6f13fcc06433db2362281059d1c09.jpg"
                    className="w-full h-[350px] rounded object-cover transform transition-transform duration-500 hover:scale-105"
                    alt="Coffee"
                  />
                </Link>
                <Link
                  to=""
                  className="block overflow-hidden shadow-lg my-10"
                >
                  <img
                    src="https://file.hstatic.net/1000075078/file/teaholic_3f320cac87814da0912f45ccfebd4e0e.jpg"
                    className="w-full h-[350px] rounded object-cover transform transition-transform duration-500 hover:scale-105"
                    alt="Coffee"
                  />
                </Link>
                <Link
                  to=""
                  className="block overflow-hidden shadow-lg"
                >
                  <img
                    src="https://file.hstatic.net/1000075078/file/blog_94b05e56224646bc86c6e72c73ac4258.jpg"
                    className="w-full h-[350px] rounded object-cover transform transition-transform duration-500 hover:scale-105"
                    alt="Coffee"
                  />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-3">
              {categoryPost.data.map((category) => (
                <div key={category._id} className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-orange-400 pl-4 mb-6">
                    {category.title}
                  </h2>
                  {renderCategoryPosts(category)}
                </div>
              ))}

              <div className="flex justify-center mt-8">
                <Link
                  to=""
                  className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg overflow-hidden transition-all duration-300 hover:text-white"
                >
                  <span className="relative z-10">Tìm hiểu thêm</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AllHomes;