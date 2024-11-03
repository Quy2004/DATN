import { Link } from "react-router-dom";
import { Product } from "../../types/product";
import instance from "../../services/api";
import { useQuery } from "@tanstack/react-query";
import { Category } from "../../types/category";

const CoffeePage: React.FC = () => {
    const coffeeCategoryId = "671a469f72e2def28dc8b8be"; // ID danh mục cà phê

    // Tìm danh mục
    const { data: categoriesData } = useQuery<Category[]>({
        queryKey: ["categories"],
        queryFn: async () => {
            const response = await instance.get("/categories");
            return response.data;
        },
    });

    // Tìm sản phẩm có ID danh mục cụ thể cho cà phê
    const { data: productsData } = useQuery<Product[]>({
        queryKey: ["products", coffeeCategoryId],
        queryFn: async () => {
            const response = await instance.get(`/products?category=${coffeeCategoryId}`);
            return response.data.data;
        },
    });
    
    // Định nghĩa giá
    const formatPrice = (price: number) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    return (
        <div className="containerAll mx-auto px-4">
            <div className="mb-8">
                <h1 className="pt-10 text-3xl font-semibold mb-3 mt-6">Cà phê</h1>
                <p className="border-b-orange-400 w-24 border-b-[4px]"></p>
            </div>
            <div className="grid grid-cols-1 grid-rows-2 gap-5 md:grid-cols-2 lg:grid-cols-4 text-left mb-12">
                {productsData?.map((coffee: Product) => (
                    <div key={coffee._id} className="item">
                        <Link to={`/detail/${coffee._id}`} className="product_img">
                            <img src={coffee.image} alt={coffee.name} className="w-full h-auto object-cover"/>
                        </Link>
                        <Link to="#">
                            <h3 className="text-2xl mt-2">{coffee.name}</h3>
                        </Link>
                        <p className="text-lg font-semibold">{formatPrice(coffee.price)} VNĐ</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CoffeePage;
