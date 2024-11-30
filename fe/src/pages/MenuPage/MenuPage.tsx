import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import instance from "../../services/api";
import { Category } from "../../types/category";
import { Product } from "../../types/product";
import { Link } from "react-router-dom";

const MenuPage: React.FC = () => {
    const [activeItem, setActiveItem] = useState<string | null>(null);
    const [activeCategoryName, setActiveCategoryName] = useState<string>("Tất cả"); // Biến lưu tên danh mục hiện tại
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        // Lắng nghe sự thay đổi kích thước màn hình
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize(); // Kiểm tra ngay khi render
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);
    // Sử dụng useQuery để fetch dữ liệu danh mục từ API
    const { data: categories, isLoading: loadingCategories, isError: errorCategories, error } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const response = await instance.get("/categories");
            return response.data.data; // Trả về đúng phần dữ liệu cần thiết
        },
    });

    // Sử dụng useQuery để fetch sản phẩm theo danh mục
    const { data: products, isLoading: loadingProducts } = useQuery({
        queryKey: ["products", activeItem],
        queryFn: async () => {
            if (activeItem === null) {
                const response = await instance.get(`/products`); // Gọi API để lấy tất cả sản phẩm
                return response.data.data;
            } else {
                const response = await instance.get(`/products?category=${activeItem}`);
                return response.data.data;
            }
        },
        enabled: true, // Luôn gọi API để fetch sản phẩm
    });

    // Xử lý khi click vào danh mục
    const handleClick = (id: string, name: string) => {
        setActiveItem(id); // Cập nhật trạng thái active
        setActiveCategoryName(name); // Cập nhật tên danh mục
    };

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
    const handleAllProductsClick = () => {
        setActiveItem(null); // Đặt activeItem là null để fetch tất cả sản phẩm
        setActiveCategoryName("Tất cả"); // Đặt lại tên danh mục
    };
    // Định giá
    const formatPrice = (price: number) => {
        const totalPrice = price;
        return totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };
    return (
        <div className="containerAll flex items-start mx-auto mt-8 md:mt-[60px] py-8">
            {/* Sidebar với danh mục cha và con */}
            <div className="hidden md:block sidebar  sticky top-[60px] w-[18%] px-4">
                <ul className="text-left">
                    {/* Mục "Tất cả" */}
                    <li>
                        <div
                            onClick={handleAllProductsClick}
                            className={`cursor-pointer flex items-center space-x-2 px-3 transition-all duration-100 ${activeItem === null
                                ? "font-bold text-orange-600"
                                : "text-gray-700 hover:text-orange-600"
                                }`}
                        >
                            <span>Tất cả</span>
                        </div>
                    </li>
                    {parentCategories.map((parent: Category) => (
                        <li key={parent._id}>
                            <div
                                onClick={() => handleClick(parent._id, parent.title)}
                                className={`cursor-pointer flex items-center space-x-2 py-1 px-3 transition-all duration-100 ${activeItem === parent._id
                                    ? "font-bold text-orange-600"
                                    : "text-gray-700 hover:text-orange-600"
                                    }`}
                            >
                                {activeItem === parent._id && (
                                    <span>
                                        {/* Icon ly cà phê */}
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
                            <ul className="ml-4">
                                {getChildCategories(parent._id).map((child: Category) => (
                                    <li key={child._id} className="list-disc ml-6 text-gray-600">
                                        <div
                                            onClick={() => handleClick(child._id, child.title)}
                                            className={`cursor-pointer py-1 transition-all duration-200 ${activeItem === child._id
                                                ? "font-bold text-orange-600"
                                                : "hover:text-orange-600"
                                                }`}
                                        >
                                            {child.title}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Nội dung sản phẩm tương ứng */}
            <div className="allproduct flex-1 w-full md:w-[82%]px-0 md:px-12 bg-white md:border-l-[3px] border-gray-300">
                <div className="md:hidden p-2 shadow-xl">
                    <form action="max-w-sm mx-auto">
                        <select className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={activeItem || ""} // Giá trị mặc định là ""
                            onChange={(e) => {
                                const selectedId = e.target.value || null;
                                const selectedTitle = e.target.options[e.target.selectedIndex].text;
                                handleClick(selectedId!, selectedTitle);
                            }}

                        >
                            <option value="" className="mt-2">Tất cả</option> {/* Mục mặc định */}
                            {parentCategories.map((parent) => (
                                <option value={parent._id}>{parent.title}</option>
                            ))}
                        </select>
                    </form>
                </div>
                <div className="mx-4 md:mx-0 mt-4 md:mt-0">
                    <h2 className="text-xl font-medium md:text-2xl md:font-semibold mb-4">{activeCategoryName}</h2> {/* Tên danh mục */}
                    {loadingProducts ? (
                        <div>Đang tải sản phẩm...</div> // Hiển thị trạng thái đang tải sản phẩm
                    ) : (
                        <div className="flex flex-wrap justify-between gap-y-4 md:grid md:grid-cols-3 md:gap-y-8">
                            {products && products.length > 0 ? (
                                products.map((product: Product) => (
                                    <div key={product._id} className="">
                                        <Link to={`/detail/${product._id}`}>
                                            <img src={`${product.image}`} className="w-[190px] h-[190px] md:w-[250px] md:h-[250px] border object-cover rounded-xl" alt={product.name} />
                                        </Link>
                                        <Link to={`/detail/${product._id}`}>
                                            <h3 className="mt-2 text-sm md:text-base font-medium">{product.name}</h3>
                                        </Link>
                                        <p className="text-gray-500 md:text-base">{formatPrice(product.price)} đ</p>
                                    </div>
                                ))
                            ) : (
                                <div className="w-max">Không có sản phẩm nào trong danh mục này.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MenuPage;
