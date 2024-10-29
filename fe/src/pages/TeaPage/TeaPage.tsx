import { Link } from "react-router-dom";
import { Product } from "../../types/product";
import instance from "../../services/api";
import { useQuery } from "@tanstack/react-query";
import { Category } from "../../types/category";

const TeaPage: React.FC = () => {
    const teaCategoryId = "671a469472e2def28dc8b8b8"; // ID danh mục trà

    // Fetch categories
    const { data: categoriesData } = useQuery<Category[]>({
        queryKey: ["categories"],
        queryFn: async () => {
            const response = await instance.get("/categories");
            return response.data;
        },
    });

    // Fetch products with a specific category ID for tea
    const { data: productsData } = useQuery<Product[]>({
        queryKey: ["products", teaCategoryId],
        queryFn: async () => {
            const response = await instance.get(`/products?category=${teaCategoryId}`);
            return response.data.data;
        },
    });
    //Định nghĩa giá
    const formatPrice = (price: number) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };
    return (
        <div className="containerAll mx-auto">
            <div className="mb-8">
                <h1 className="pt-10 text-3xl font-semibold mb-3 mt-6">Trà</h1>
                <p className="border-b-orange-400 w-10 border-b-[4px]"></p>
            </div>
            <div className="row grid grid-cols-4 gap-5 text-left mb-12">
                {productsData?.map((tea: Product) => (
                    <div key={tea._id} className="item">
                        <Link to={`/detail/${tea._id}`} className="product_img">
                            <img src={tea.image} alt={tea.name} />
                        </Link>
                        <Link to="#">
                            <h3 className="text-2xl">{tea.name}</h3>
                        </Link>
                        <p>{formatPrice(tea.price)} VNĐ</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeaPage;
