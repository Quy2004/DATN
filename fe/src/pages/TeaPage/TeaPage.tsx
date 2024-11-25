import { Link } from "react-router-dom";
import { Product } from "../../types/product";
import instance from "../../services/api";
import { useQuery } from "@tanstack/react-query";
import { Category } from "../../types/category";

const TeaPage: React.FC = () => {
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
        queryKey: ["products"],
        queryFn: async () => {
            const response = await instance.get(`/products/tea`);
            return response.data.data;
        },
    });

    // Định nghĩa giá
    const formatPrice = (price: number) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    return (
        <div className="containerAll mt-[60px] mx-4 md:px-4 md:mx-auto ">
            <div className=" *:mx-auto mb-6 *:md:mx-0 md:mb-8">
                <h1 className="w-max pt-4 text-xl font-semibold mb-1 mt-6 md:text-3xl md:mb-3 md:pt-10">Trà</h1>
                <p className=" border-b-orange-400 w-[26px] md:w-[40px] border-b-[4px]"></p>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-4 justify-center md:gap-5 text-left mb-4 md:justify-start md:grid-cols-4">
                {productsData?.map((tea: Product) => (
                    <div key={tea._id} className="item">
                        <Link to={`/detail/${tea._id}`} className="md:product_img">
                            <img src={tea.image} alt={tea.name} className="w-[180px] h-[180px] border-2 rounded-lg md:w-full md:h-auto object-cover" />
                        </Link>
                        <div className="*:leading-4 ">
                            <Link to="#">
                                <h3 className="text-2xl mt-0 md:mt-2">{tea.name}</h3>
                            </Link>
                            <p className="text-sm font-semibold">{formatPrice(tea.price)} VNĐ</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

    );
};

export default TeaPage;
