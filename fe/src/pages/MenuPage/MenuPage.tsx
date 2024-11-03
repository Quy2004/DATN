import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import instance from "../../services/api";
import { Category } from "../../types/category";
import { Product } from "../../types/product";

const MenuPage: React.FC = () => {
    const [activeItem, setActiveItem] = useState<string | null>(null);

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
    const handleClick = (id: string) => {
        setActiveItem(id); // Cập nhật trạng thái active
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
    const parentCategories = categories.filter(
        (category: Category) => !category.parent_id
    );

    // Lọc danh mục con theo parent_id
    const getChildCategories = (parentId: string) =>
        categories.filter(
            (category: Category) =>
                category.parent_id && category.parent_id._id === parentId
        );

    // Thêm danh mục "Tất cả"
    const handleAllProductsClick = () => {
        setActiveItem(null); // Đặt activeItem là null để fetch tất cả sản phẩm
    };

    return (
        <div className="containerAll flex items-start mx-auto p-6">
            {/* Sidebar với danh mục cha và con */}
            <div className="sidebar  sticky top-[60px] w-[20%] p-4">
                <ul className="text-left">
                    {/* Mục "Tất cả" */}
                    <li>
                        <div
                            onClick={handleAllProductsClick}
                            className={`cursor-pointer flex items-center space-x-2 py-1 px-3 transition-all duration-100 ${activeItem === null
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
                                onClick={() => handleClick(parent._id)}
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
                                            onClick={() => handleClick(child._id)}
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
            <div className="allproduct flex-1 w-[80%] p-6 bg-white border-l-2 border-gray-300">
                {loadingProducts ? (
                    <div>Đang tải sản phẩm...</div> // Hiển thị trạng thái đang tải sản phẩm
                ) : (
                    <div className="">
                        {products && products.length > 0 ? (
                            products.map((product: Product) => (
                                
                                <div key={product._id}>
                                    <div>
                                        <img src={`${product.image}`} className="" alt="" />
                                        <h1>{product.name}</h1>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div>Không có sản phẩm nào trong danh mục này.</div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuPage;
