/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import instance from "../../services/api";
import { Product } from "../../types/product";

const DetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const [selectedSize, setSelectedSize] = useState('M');
    const sizes = ['S + 10.000đ', 'M + 15.000đ', 'L + 20.000đ', 'XL + 25.000đ'];
    const [mainImage, setMainImage] = useState(''); // State for the main image
    const [products, setProducts] = useState([]);
    const fetchProducts = async () => {
        try {
            const { data } = await instance.get("/products"); // Gọi API từ backend
            setProducts(data.data); // Lưu dữ liệu sản phẩm vào state
            // setLoading(false); // Tắt trạng thái loading
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm:", error);
            // setLoading(false); // Tắt trạng thái loading trong trường hợp lỗi
        }
    };
    useEffect(() => {
        fetchProducts();
    }, []);


    const { data: product, isLoading, error } = useQuery<Product>({
        queryKey: ["product", id],
        queryFn: async () => {
            const response = await instance.get(`/products/${id}`);
            return response.data.data; // Adjust based on your API response structure
        },
    });

    useEffect(() => {
        if (product) {
            // Set the initial main image to the first thumbnail or product image
            setMainImage(product.thumbnail[0] || product.image);
        }
    }, [product]);

    const changeImage = (src: any) => {
        setMainImage(src); // Change the main image to the selected thumbnail
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>An error occurred: {(error as Error).message}</div>;

    return (
        <>
            {product && (
                <div className="">
                    <div className="containerAll mx-auto px-4 py-8">
                        <div className="flex flex-wrap-mx-4 mt-20">
                            {/* Product Images */}
                            <div className="w-45% px-4 mb-4">
                                <img
                                    src={mainImage}
                                    alt="Product"
                                    className="w-[500px] h-[500px] mx-auto bg-cover rounded-sm border-2 shadow-md mb-4"
                                />
                                <div className="flex gap-4 py-4 justify-center overflow-x-auto">
                                    {Array.isArray(product.thumbnail) && product.thumbnail.slice(0, 4).map((thumb, index) => (
                                        <img
                                            key={index}
                                            src={thumb}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-20 h-20 object-cover rounded-md cursor-pointer opacity-60 hover:opacity-100 transition duration-300 border-2"
                                            onClick={() => changeImage(thumb)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="w-[55%] px-4">
                                <h2 className="text-4xl font-bold mb-2">
                                    {product.name}
                                </h2>
                                <div className="mb-4">
                                    <span className="text-2xl font-bold mr-2">{product.price}đ</span>
                                </div>
                                <hr className="mb-3" />
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-2">Size:</h3>
                                    <div className="flex gap-4">
                                        {sizes.map(size => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`w-40 h-10 flex items-center justify-center rounded text-sm font-bold ${selectedSize === size
                                                    ? 'bg-[#ea8025] text-white border-2'
                                                    : 'text-black border-2 border-[#ea8025]'}`
                                                }
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <label
                                        htmlFor="quantity"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Số lượng:
                                    </label>
                                    <input
                                        type="number"
                                        id="quantity"
                                        name="quantity"
                                        min={1}
                                        defaultValue={1}
                                        className="w-16 text-center rounded-md border-[#ea8025] shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    />
                                </div>
                                <div className="flex space-x-4 mb-6">
                                    <button className="bg-[#ea8025] flex gap-2 items-center text-white px-6 py-2 rounded-md hover:bg-[#FF6600] focus:outline-none">
                                        Thêm vào giỏ hàng
                                    </button>
                                    <button className="bg-[#ea8025] flex gap-2 items-center text-white px-6 py-2 rounded-md hover:bg-[#FF6600] focus:outline-none">
                                        Mua ngay
                                    </button>
                                </div>
                            </div>
                        </div>
                        <hr className="mb-4 mx-4" />
                        <div className="mx-4">
                            <h1 className="font-medium">Mô tả sản phẩm:</h1>
                            <p className="text-gray-700 mb-4 mt-1" dangerouslySetInnerHTML={{ __html: product.description }}></p>
                        </div>
                        <hr className='my-2' />
                        <div>
                            <h1>Sản phẩm khác</h1>
                            <div className='flex border-2'>
                                {products.slice(0, 6).map((item: Product) => (
                                    <div key={item._id}>
                                        <h1>{item.name}</h1>
                                        <img src={item.image} alt="image" className='w-1/5' />
                                        <p>{item.price}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
};

export default DetailPage;
