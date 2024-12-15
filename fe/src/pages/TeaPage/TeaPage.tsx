import { useState } from "react";
import { Link } from "react-router-dom";
import { Product } from "../../types/product";
import instance from "../../services/api";
import { useQuery } from "@tanstack/react-query";
import { Category } from "../../types/category";

const TeaPage: React.FC = () => {
  // State for pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 8; // Number of items per page

  // Fetch categories
  const { data: categoriesData } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await instance.get("/categories");
      return response.data;
    },
  });

  // Fetch products with pagination
  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery<Product[]>({
    queryKey: ["products", page], // Include page as a key for query
    queryFn: async () => {
      const response = await instance.get(
        `/products/tea?page=${page}&limit=${itemsPerPage}`
      );
      return response.data.data;
    },
  });

  // Function to format price
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Handle page change and scroll to the top
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1) {
      setPage(newPage);
      window.scrollTo(0, 0); // Scroll to the top when the page changes
    }
  };

  return (
    <div className="containerAll mt-[60px] mx-4 md:px-4 md:mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="w-max pt-4 text-xl font-semibold mb-1 mt-6 md:text-3xl md:mb-3 md:pt-10">
          Trà
        </h1>
        <p className="border-b-orange-400 w-[26px] md:w-[40px] border-b-[4px]"></p>
      </div>

      {/* Display Loading or Error */}
      {isLoading && <p>Đang tải sản phẩm...</p>}
      {error && <p>Lỗi khi lấy sản phẩm!</p>}

      <div className="flex flex-wrap gap-x-5 gap-y-4 justify-center md:gap-5 text-left mb-4 md:justify-start md:grid-cols-4">
        {productsData?.map((tea: Product) => {
          const isOutOfStock = tea.status === "unavailable";

          return (
            <div key={tea._id} className="item">
              <Link to={`/detail/${tea._id}`} className="md:product_img">
                <img
                  src={tea.image}
                  alt={tea.name}
                  className="w-[180px] h-[180px] border-2 rounded-lg md:w-full md:h-auto object-cover"
                />
              </Link>
              <div>
                <Link to="#">
                  <h3 className="text-2xl mt-0 md:mt-2">{tea.name}</h3>
                </Link>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">
                    {formatPrice(tea.price)} VNĐ
                  </p>
                  {isOutOfStock ? (
                    <p className="text-red-500 text-sm">Hết hàng</p>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination controls with Vietnamese labels */}
      <div className="flex justify-center mt-10 mb-10">
        <button
          className="px-4 py-2 border rounded-lg mr-2"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          Trước
        </button>

        <button
          className="px-4 py-2 border rounded-lg ml-2"
          onClick={() => handlePageChange(page + 1)}
          disabled={productsData && productsData.length < itemsPerPage}
        >
          Sau
        </button>
      </div>
    </div>
  );
};

export default TeaPage;
