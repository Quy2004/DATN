import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import instance from "../../services/api";
import { Category } from "../../types/category";
import { Product } from "../../types/product";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const MenuPage: React.FC = () => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [activeCategoryName, setActiveCategoryName] =
    useState<string>("Tất cả"); // Biến lưu tên danh mục hiện tại
  const [isMobile, setIsMobile] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState({
    totalItems: 0,
    currentPage: 1,
    totalPages: 1,
  });
  const scrollToTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollToTopRef.current) {
      scrollToTopRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentPage]);
  useEffect(() => {
    // Lắng nghe sự thay đổi kích thước màn hình
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Kiểm tra ngay khi render
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // Sử dụng useQuery để fetch dữ liệu danh mục từ API
  const {
    data: categories,
    isLoading: loadingCategories,
    isError: errorCategories,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await instance.get("/categories");
      return response.data.data; // Trả về đúng phần dữ liệu cần thiết
    },
  });

  // Sửa lại useQuery để hỗ trợ lọc tốt hơn
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ["products", activeItem, currentPage, sortBy, priceRange],
    queryFn: async () => {
      let url = "/products";

      if (activeItem) {
        // Kiểm tra xem có phải danh mục cha không
        const isParentCategory = parentCategories.some(
          (cat) => cat._id === activeItem
        );

        if (isParentCategory) {
          // Lấy tất cả ID danh mục con
          const childCategoryIds = getAllChildCategoryIds(activeItem);

          // Fetch sản phẩm từ tất cả các danh mục liên quan
          const productPromises = childCategoryIds.map((categoryId) =>
            instance.get(`/products?category=${categoryId}`)
          );

          const responses = await Promise.all(productPromises);
          const allProducts = responses.flatMap(
            (response) => response.data.data
          );

          // Loại bỏ trùng lặp
          const uniqueProducts = Array.from(
            new Map(allProducts.map((item) => [item._id, item])).values()
          );

          // Áp dụng phân trang cho kết quả đã lọc
          const startIndex = (currentPage - 1) * 12;
          const endIndex = startIndex + 12;
          const paginatedProducts = uniqueProducts.slice(startIndex, endIndex);

          setPagination({
            totalItems: uniqueProducts.length,
            currentPage: currentPage,
            totalPages: Math.ceil(uniqueProducts.length / 12),
          });

          return paginatedProducts;
        } else {
          // Nếu là danh mục con, fetch bình thường
          url += `?category=${activeItem}&page=${currentPage}&limit=12`;
        }
      } else {
        url += `?page=${currentPage}&limit=12`;
      }

      const response = await instance.get(url);
      setPagination({
        totalItems: response.data.pagination.totalItems,
        currentPage: response.data.pagination.currentPage,
        totalPages: response.data.pagination.totalPages,
      });
      return response.data.data;
    },
    enabled: true,
  });

  // Hàm lọc sản phẩm tổng quát
  const filterProducts = (products: Product[]) => {
    if (!products) return [];

    let filtered = [...products];

    // Lọc theo khoảng giá
    if (priceRange !== "all") {
      filtered = filtered.filter((product) => {
        switch (priceRange) {
          case "0-25000":
            return product.price < 25000;
          case "25000-50000":
            return product.price >= 25000 && product.price <= 50000;
          case "50000+":
            return product.price > 50000;
          default:
            return true;
        }
      });
    }

    // Sắp xếp
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    return filtered;
  };

  // useEffect để cập nhật filteredProducts
  useEffect(() => {
    if (products) {
      const filtered = filterProducts(products);
      setFilteredProducts(filtered);
    }
  }, [products, sortBy, priceRange]);
  // Hàm lấy tất cả danh mục con của một danh mục cha
  const getAllChildCategoryIds = (parentId: string): string[] => {
    // Lấy tất cả danh mục con trực tiếp
    const directChildCategories = categories.filter(
      (category: Category) =>
        category.parent_id && category.parent_id._id === parentId
    );

    // Lấy ID của các danh mục con trực tiếp
    const directChildIds = directChildCategories.map(
      (cat: Category) => cat._id
    );

    // Kiểm tra xem có danh mục con của danh mục con không
    const deepChildIds = directChildCategories.flatMap((parentCat: Category) =>
      categories
        .filter(
          (category: Category) =>
            category.parent_id && category.parent_id._id === parentCat._id
        )
        .map((cat: Category) => cat._id)
    );

    // Gộp tất cả các ID lại
    return [...directChildIds, ...deepChildIds, parentId];
  };

  // Cập nhật hàm handleClick
  const handleClick = async (id: string, name: string) => {
    setActiveItem(id);
    setActiveCategoryName(name);
    setCurrentPage(1);

    try {
      // Kiểm tra xem có phải danh mục cha không
      const isParentCategory = parentCategories.some((cat) => cat._id === id);

      let fetchedProducts: Product[] = [];

      if (isParentCategory) {
        // Lấy tất cả ID danh mục con
        const childCategoryIds = getAllChildCategoryIds(id);

        // Fetch sản phẩm từ tất cả các danh mục con
        const productPromises = childCategoryIds.map((categoryId) =>
          instance.get(`/products?category=${categoryId}`)
        );

        const productResponses = await Promise.all(productPromises);

        // Gộp sản phẩm từ tất cả các response
        fetchedProducts = productResponses.flatMap(
          (response) => response.data.data
        );

        // Loại bỏ sản phẩm trùng lặp
        fetchedProducts = Array.from(
          new Map(fetchedProducts.map((item) => [item._id, item])).values()
        );
      } else {
        // Nếu là danh mục con, fetch bình thường
        const response = await instance.get(`/products?category=${id}`);
        fetchedProducts = response.data.data;
      }

      // Loại bỏ các sản phẩm bị xóa (isDeleted = true)
      fetchedProducts = fetchedProducts.filter((product) => !product.isDeleted);

      // Áp dụng bộ lọc và sắp xếp
      const filteredAndSortedProducts = filterProducts(fetchedProducts);

      setFilteredProducts(filteredAndSortedProducts);
    } catch (error) {
      console.error("Lỗi khi tìm nạp sản phẩm:", error);
      setFilteredProducts([]);
    }
  };

  // useEffect để theo dõi thay đổi bộ lọc
  useEffect(() => {
    if (products) {
      const filtered = filterProducts(products);
      setFilteredProducts(filtered);
    }
  }, [products, sortBy, priceRange]);

  if (loadingCategories) {
    return <div>Đang tải danh mục...</div>; // Hiển thị trạng thái đang tải
  }

  if (errorCategories) {
    return (
      <div>
        Đã xảy ra lỗi:{" "}
        {error instanceof Error ? error.message : "Lỗi không xác định"}
      </div>
    ); // Hiển thị lỗi
  }

  // Tách danh mục cha (các mục không có parent_id hoặc parent_id là null)
  const parentCategories = Array.isArray(categories)
    ? categories.filter((category: Category) => !category.parent_id)
    : [];

  // Lọc danh mục con theo parent_id
  const getChildCategories = (parentId: string) =>
    categories?.filter(
      (category: Category) =>
        category.parent_id && category.parent_id._id === parentId
    );

  // Thêm danh mục "Tất cả"
  // Sửa lại handleAllProductsClick
  const handleAllProductsClick = () => {
    setActiveItem(null);
    setActiveCategoryName("Tất cả");
    setCurrentPage(1); // Reset về trang 1
    setFilteredProducts([]); // Reset filtered products
  };

  // Định giá
  const formatPrice = (price: number) => {
    const totalPrice = price;
    return totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  return (
    <>
      <div ref={scrollToTopRef}></div>
      <div className="containerAll flex items-start mx-auto mt-8 md:mt-[60px] py-8">
        {/* Sidebar với danh mục cha và con */}
        <div className="hidden md:block sidebar sticky top-[60px] w-[18%] px-4">
          <ul className="text-left">
            {/* Mục "Tất cả" */}
            <li>
              <div
                onClick={handleAllProductsClick}
                className={`cursor-pointer flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-300 ease-in-out ${activeItem === null
                  ? "font-bold text-orange-600 bg-orange-50"
                  : "text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                  }`}
              >
                <span>Tất cả</span>
              </div>
            </li>

            {/* Danh mục cha */}
            {parentCategories.map((parent: Category) => (
              <li key={parent._id} className="mb-1">
                <div className="flex justify-between items-center">
                  {/* Phần tiêu đề danh mục cha */}
                  <div
                    onClick={() => handleClick(parent._id, parent.title)}
                    className={`cursor-pointer flex-1 flex items-center py-2 px-3 rounded-md transition-all duration-200 ease-in-out ${activeItem === parent._id
                      ? "font-bold text-orange-600 bg-orange-50"
                      : "text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                      }`}
                  >
                    <div className="flex items-center space-x-2">
                      {activeItem === parent._id && (
                        <span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-5 h-5 text-orange-600"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8 3h8a1 1 0 011 1v10a5 5 0 01-5 5H8a5 5 0 01-5-5V4a1 1 0 011-1h1M18 8h2a2 2 0 010 4h-2"
                            />
                          </svg>
                        </span>
                      )}
                      <span>{parent.title}</span>
                    </div>
                  </div>

                  {/* Nút mũi tên xổ xuống tách riêng */}
                  <div
                    onClick={() =>
                      setExpandedCategory(
                        expandedCategory === parent._id ? null : parent._id
                      )
                    }
                    className="cursor-pointer p-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-4 h-4 transition-transform duration-300 ease-in-out ${expandedCategory === parent._id ? "rotate-180" : ""
                        }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Phần danh mục con */}
                <AnimatePresence>
                  {expandedCategory === parent._id && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="ml-4 overflow-hidden"
                    >
                      {getChildCategories(parent._id).map((child: Category) => (
                        <motion.li
                          key={child._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className="list-disc ml-6 text-gray-600"
                        >
                          <div
                            onClick={() => handleClick(child._id, child.title)}
                            className={`cursor-pointer py-2 px-3 rounded-md transition-all duration-300 ease-in-out ${activeItem === child._id
                              ? "font-bold text-orange-600 bg-orange-50"
                              : "hover:text-orange-600 hover:bg-orange-50"
                              }`}
                          >
                            {child.title}
                          </div>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
        </div>

        {/* Product content */}
        <div className="allproduct flex-1 w-full md:w-[82%] px-0 md:px-12 bg-white md:border-l-[3px] border-gray-300">
          {/* Mobile select */}
          <div className="md:hidden p-2 shadow-xl">
            <form action="mx-auto">
              <select
                className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={activeItem || ""} // Giá trị mặc định là ""
                onChange={(e) => {
                  const selectedId = e.target.value || null;
                  const selectedTitle =
                    e.target.options[e.target.selectedIndex].text;
                  handleClick(selectedId!, selectedTitle);
                }}
              >
                <option value="" className="mt-2 max-w-xs">
                  Tất cả
                </option>{" "}
                {/* Mục mặc định */}
                {parentCategories.map((parent) => (
                  <option value={parent._id}>{parent.title}</option>
                ))}
              </select>
            </form>
          </div>

          <div className="mx-4 md:mx-0 mt-4 md:mt-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h2 className="text-xl font-medium md:text-2xl md:font-semibold">
                {activeCategoryName}
              </h2>

              {/* Filtering options */}
              <div className="flex md:flex-row gap-4 mt-4 md:mt-0">
                <motion.select
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="px-10 py-2 border rounded-lg bg-white w-full appearance-none cursor-pointer transition-all duration-300 ease-in-out focus:ring-2 focus:ring-orange-200 focus:border-orange-400 pr-8"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                >
                  <option value="all">Tất cả giá</option>
                  <option value="0-25000">Dưới 25.000đ</option>
                  <option value="25000-50000">25.000đ - 50.000đ</option>
                  <option value="50000+">Trên 50.000đ</option>
                </motion.select>

                <motion.select
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="px-10 py-2 border rounded-lg bg-white w-full appearance-none cursor-pointer transition-all duration-300 ease-in-out focus:ring-2 focus:ring-orange-200 focus:border-orange-400 pr-8"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="default">Mặc định</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                  <option value="name-asc">Tên A-Z</option>
                  <option value="name-desc">Tên Z-A</option>
                </motion.select>
              </div>
            </div>

            {loadingProducts ? (
              <div>Đang tải sản phẩm...</div>
            ) : (
              <div className="flex flex-wrap justify-between gap-y-4 md:grid md:grid-cols-3 md:gap-y-8">
                {filteredProducts && filteredProducts.length > 0 ? (
                  filteredProducts
                    .filter(
                      (product: Product) => !product.isDeleted && product.active
                    ) // Lọc sản phẩm chưa bị xóa và đang hoạt động
                    .map((product: Product) => (
                      <div key={product._id} className="max-w-[190px] md:max-w-[250px]">
                        <Link to={`/detail/${product._id}`}>
                          <img
                            src={`${product.image}`}
                            className="w-[190px] h-[190px] md:w-[250px] md:h-[250px] border object-cover rounded-xl"
                            alt={product.name}
                          />
                        </Link>
                        <Link to={`/detail/${product._id}`}>
                          <h3 className="mt-2 text-sm md:text-base font-medium">
                            {product.name}
                          </h3>
                        </Link>

                        <p className="text-sm text-gray-500 flex justify-between items-center ">
                          {product.status === "available" ? (
                            <>{formatPrice(product.price)} VNĐ</>
                          ) : (
                            <>
                              {formatPrice(product.price)} VNĐ
                              <span className="font-medium text-red-500">
                                Hết hàng
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    ))
                ) : (
                  <div className="w-max">
                    Không có sản phẩm nào trong danh mục này.
                  </div>
                )}
              </div>
            )}

            {products && products.length > 0 && (
              <div className="flex justify-center mt-8">
                {Array.from(
                  { length: pagination.totalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    key={page}
                    className={`px-4 py-2 mx-1 rounded-md transition-all duration-300 ease-in-out ${pagination.currentPage === page
                      ? "bg-orange-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-orange-600 hover:text-white"
                      }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuPage;
