import React, { useEffect, useState } from 'react';
import { Product } from '../../types/product';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import instance from '../../services/api';

const DetailPage = () => {
    // const images = [
    //   'img/image-1.png',
    //   'img/small-img-2.png',
    //   'img/small-img-3.png',
    //   'img/image-1.png'
    // ];
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
    const { id } = useParams<{ id: string }>();
    const { data: product, isLoading, error } = useQuery<Product>({
        queryKey: ["product", id],
        queryFn: async () => {
            const response = await instance.get(`/products/${id}`);
            console.log("Full response:", response); // Log toàn bộ response để kiểm tra
            return response.data.data; // Điều chỉnh tùy thuộc vào cấu trúc response
        }
    });

    // console.log("Fetched product data:", product);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>An error occurred: {(error as Error).message}</div>;

    return (
        <>
            {product && (
                <section className="max-w-6xl mx-auto p-6">
                    <div className="flex flex-col md:flex-row gap-10">
                        {/* Left side */}
                        <div className="md:w-2/5">
                            <img src={product.image} alt="Featured" className="w-full rounded-lg object-cover h-80"
                            />
                        </div>
                        {/* Right side */}
                        <div className="md:w-3/5 mt-10">
                            <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                            <h5 className="text-xl font-semibold text-red-600 mb-2">{product.price}</h5>
                            <p className="text-gray-600 mb-4">Mô tả sản phẩm.</p>
                            {/* <span>{product.description}</span> */}
                            <div className="mb-4">
                                <p className="text-lg font-medium">Chọn size (bắt buộc)</p>
                            </div>
                            <div className="flex items-center gap-4 mb-4">
                                <input
                                    type="number"
                                    min="1"
                                    className="w-16 h-10 border rounded px-2"
                                />
                                <button className="bg-orange-500 text-white px-6 py-2 rounded">
                                    Add to Cart
                                </button>
                            </div>
                            <div className="text-gray-500 text-sm">
                                <p>Free standard shipping on orders over $35 before tax, plus free returns.</p>
                            </div>
                        </div>
                    </div>
                    <hr className='my-2' />
                    <div>
                        <h2>Mô tả sản phẩm</h2>
                        <i>{product.description}</i>
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
                </section>
            )}
        </>
    );
};

export default DetailPage;
