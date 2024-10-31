import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import instance from "../../services/api";
import { Product } from "../../types/product";
import toast from "react-hot-toast";

const DetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const [selectedSize, setSelectedSize] = useState('M');
    const sizes = ['S + 10.000đ', 'M + 15.000đ', 'L + 20.000đ', 'XL + 25.000đ'];
    const [mainImage, setMainImage] = useState(''); 
    const [products, setProducts] = useState([]);

    const fetchProducts = async () => {
        try {
            const { data } = await instance.get("/products");
            setProducts(data.data);
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm:", error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const { data: product, isLoading, error } = useQuery<Product>({
        queryKey: ["product", id],
        queryFn: async () => {
            const response = await instance.get(`/products/${id}`);
            return response.data.data;
        },
    });

    useEffect(() => {
        if (product) {
            setMainImage(product.image); // Thiết lập ảnh chính từ ảnh sản phẩm
        }
    }, [product]);

    const changeImage = (src: string) => {
        setMainImage(src); // Thay đổi ảnh chính
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>An error occurred: {(error as Error).message}</div>;

    const formatPrice = (price: number) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

  const addToCart = async (productId: string) => {
   console.log({
    userId: user._id,
    productId: productId,
    quantity: 1,
  });
   
    if (!productId) {
      return toast.success("Vui lòng đăng nhập tài khoản hoặc chọn sản phẩm hợp lệ");
    }
    try {
      const { data } = await instance.post("/cart", {
        userId: user._id,
        productId: productId,
        quantity: 1,
      });
      console.log("Data returned from API:", data);
      toast.success(data.messsage || "Thêm thành công");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng");
    }
  };
    const addToCart = async (productId: string) => {
        if (!productId) {
            return toast.success("Vui lòng đăng nhập tài khoản hoặc chọn sản phẩm hợp lệ");
        }
        try {
            const { data } = await instance.post("/cart", {
                productId: productId,
                quantity: 1,
            });
            toast.success(data.message || "Thêm thành công");
        } catch (error) {
            console.error("Failed to add to cart:", error);
            toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng");
        }
    };

    return (
        <>
            {product && (
                <div>
                    <div className="containerAll mx-auto px-4 py-8">
                        <div className="flex flex-wrap-mx-4 my-8 ">
                            {/* Product Images */}
                            <div className="w-45% px-4 mb-4">
                                <img
                                    src={mainImage}
                                    alt="Product"
                                    className="w-[500px] h-[500px] mx-auto bg-cover rounded-sm border-2 shadow-md mb-4"
                                />
                                <div className="flex gap-4 py-4 justify-center overflow-x-auto">
                                    {/* Thumbnails */}
                                    <img
                                        src={product.image} // Hiển thị ảnh chính trong thumbnail
                                        alt="Main Product Thumbnail"
                                        className="w-20 h-20 object-cover rounded-md cursor-pointer opacity-60 hover:opacity-100 transition duration-300 border-2"
                                        onClick={() => changeImage(product.image)} // Có thể click để xem ảnh chính
                                    />
                                    {Array.isArray(product.thumbnail) && product.thumbnail.slice(0, 4).map((thumb, index) => (
                                        <img
                                            key={index}
                                            src={thumb}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-20 h-20 object-cover rounded-md cursor-pointer opacity-60 hover:opacity-100 transition duration-300 border-2"
                                            onClick={() => changeImage(thumb)} // Thay đổi ảnh chính khi nhấp vào thumbnail
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
                                    <span className="text-2xl font-bold mr-2">{formatPrice(product.price)}đ</span>
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
                                                    : 'text-black border-2 border-[#ea8025]'}`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
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
                                    <div className="flex">
                                        <button
                                            onClick={() => addToCart(product?._id)}
                                            className="relative bg-white  px-6 py-2 border border-[#ea8025] text-lg rounded-md transition duration-300 overflow-hidden focus:outline-none cursor-pointer group text-black font-semibold"
                                        >
                                            <span className="relative z-10 transition duration-300 group-hover:text-white">
                                                <p className="text-base">Thêm giỏ hàng</p>
                                            </span>
                                            <span className="absolute inset-0 bg-[#ea8025] opacity-0 transform -translate-x-full transition-all duration-1000 group-hover:translate-x-0 group-hover:opacity-50"></span>
                                        </button>
                                    </div>
                                    <button className="bg-[#ea8025] flex gap-2 items-center text-white px-6 py-2 rounded-md hover:bg-[#FF6600] focus:outline-none">
                                        Mua ngay
                                    </button>
                                </div>
                            </div>
                        </div>
                        <hr className="mb-4 mx-4" />
                        <div className="mx-4">
                            <h1 className="font-medium text-xl">Mô tả sản phẩm:</h1>
                            <p className="text-gray-700 mb-4 mt-1" dangerouslySetInnerHTML={{ __html: product.description }}></p>
                        </div>
                        <hr className="my-2 mx-4" />
                        <div className="mx-4">
                            <h1 className="my-2 font-medium text-xl">Sản phẩm khác</h1>
                            <div className='flex'>
                                {products.slice(0, 6).map((item: Product) => (
                                    <div key={item._id} className="w-full">
                                        <img src={item.image} alt="image" className='w-[160px] h-[160px] mx-auto rounded-lg border-2 my-2' />
                                        <Link to={`detail/${item._id}`}>
                                            <h3 className="mx-2">{item.name}</h3>
                                        </Link>
                                        <p className="mx-2 text-xs text-[#838080]">{formatPrice(item.price)} VNĐ</p>
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
