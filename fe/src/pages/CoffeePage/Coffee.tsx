import { Link } from "react-router-dom";
import { Product } from "../../types/product";
import instance from "../../services/api";
import { useQuery } from "@tanstack/react-query";
import { Category } from "../../types/category";
import { useState } from "react";

const CoffeePage: React.FC = () => {
  const [page, setPage] = useState(1);
  const itemsPerPage = 8; // Number of items per page
  // Tìm danh mục
  const { data: categoriesData } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await instance.get("/categories");
      return response.data;
    },
  });

  const { data: productsData } = useQuery<Product[]>({
    queryKey: ["products", page], // Thêm page vào queryKey
    queryFn: async () => {
      const response = await instance.get(`/products/coffee?page=${page}`);
      return response.data.data;
    },
  });

  // Định nghĩa giá
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  // Handle page change and scroll to the top
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1) {
      setPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="containerAll mt-[60px] mx-4 md:px-4 md:mx-auto">
      <div className="*:mx-auto mb-6 *:md:mx-0 md:mb-8">
        <h1 className="w-max pt-4 text-xl font-semibold mb-1 mt-6 md:text-3xl md:mb-3 md:pt-10">
          Cà Phê
        </h1>
        <p className=" border-b-orange-400 w-[62px] md:w-[91px] border-b-[4px]"></p>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-4 justify-center md:gap-5 text-left mb-4 md:justify-start md:grid-cols-4">
        {productsData?.map((coffee: Product) => {
          // Check if the product is available and active
          const isOutOfStock = coffee.status === "unavailable";

          return (
            <div key={coffee._id} className="item">
              <Link to={`/detail/${coffee._id}`} className="md:product_img">
                <img
                  src={coffee.image}
                  alt={coffee.name}
                  className="w-[180px] h-[180px] border-2 rounded-lg md:w-full md:h-auto object-cover"
                />
              </Link>
              <div>
                <Link to="#">
                  <h3 className="text-sm mt-0 md:mt-2 max-w-[190px] md:max-w-[250px]">{coffee.name}</h3>
                </Link>
                <div className="flex justify-between">
                  {" "}
                  <p className="text-sm text-gray-500">
                    {formatPrice(coffee.price)} VNĐ
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

export default CoffeePage;
