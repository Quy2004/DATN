/* eslint-disable @typescript-eslint/no-unused-vars */
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import instance from "../../services/api";
import { Product, ProductSize, ProductTopping } from "../../types/product";
import toast from "react-hot-toast";

const DetailPage = () => {
  const user = JSON.parse(localStorage.getItem("user") || "");
  const { id } = useParams<{ id: string }>();
  const [mainImage, setMainImage] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1); // Thêm state cho số lượng

  // Size + Topping
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<ProductTopping[]>(
    []
  );

  console.log(selectedProduct)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await instance.get(`/products/${id}`);
        setSelectedProduct(data.data); // Lưu sản phẩm vào state
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
        toast.error("Không thể tải sản phẩm.");
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await instance.get("/products");
        setProducts(response.data.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Không thể tải danh sách sản phẩm.");
      }
    };
    fetchProducts();
  }, []);

  const handleSizeChange = (size: ProductSize) => {
    setSelectedSize(size); // Cập nhật kích thước đã chọn
  };

  const handleToppingChange = (topping: ProductTopping) => {
    setSelectedToppings((prev) =>
      prev.includes(topping)
        ? prev.filter((top) => top !== topping)
        : [...prev, topping]
    );
  };

  const {
    data: product,
    isLoading,
    error,
  } = useQuery<Product>({
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

  const formatPrice = (
    basePrice: number,
    sizePrice: number,
    quantity: number
  ) => {
    const totalPrice = (basePrice + sizePrice) * quantity;
    return totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const listPrice = (price: number) => {
    const totalPrice = price;
    return totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(event.target.value, 10);
    setQuantity(newQuantity >= 1 ? newQuantity : 1);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {(error as Error).message}</div>;
  //add To Cart
  const addToCart = async (productId: string) => {
    if (!productId) {
      return toast.success(
        "Vui lòng đăng nhập tài khoản hoặc chọn sản phẩm hợp lệ"
      );
    }
    try {
      const { data } = await instance.post("/cart", {
        userId: user._id,
        productId: productId,
        quantity: quantity,
        productSizes: selectedSize?.size_id,
        productToppings: selectedToppings?.topping_id
      });
      
      console.log("Data returned from API:", data);
      toast.success(data.messsage || "Thêm thành công");
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
            <div className="flex flex-wrap-mx-4 my-2 ">
              {/* Product Images */}
              <div className="w-45% px-4 mb-4">
                <img
                  src={mainImage}
                  alt="Product"
                  className="w-[480px] h-[480px] mx-auto bg-cover rounded-lg border-2 shadow-md mb-4"
                />
                <div className="flex gap-4 justify-center overflow-x-auto">
                  {/* Thumbnails */}
                  <img
                    src={product.image} // Hiển thị ảnh chính trong thumbnail
                    alt="Main Product Thumbnail"
                    className="w-20 h-20 object-cover rounded-md cursor-pointer opacity-60 hover:opacity-100 transition duration-300 border-2"
                    onClick={() => changeImage(product.image)} // Có thể click để xem ảnh chính
                  />
                  {Array.isArray(product.thumbnail) &&
                    product.thumbnail.slice(0, 4).map((thumb, index) => (
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
                <h2 className="text-4xl font-bold mb-2">{product.name}</h2>
                <div className="mb-4">
                  <span className="text-lg font-medium mr-2">
                    {formatPrice(
                      product.price,
                      selectedSize?.size_id.priceSize || 0,
                      quantity
                    )}{" "}
                    VNĐ
                  </span>
                </div>
                <hr className="mb-3" />
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">
                    Chọn size (Bắt buộc)
                  </h3>
                  <div className="my-3">
                    {selectedProduct ? (
                      selectedProduct.product_sizes.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {selectedProduct.product_sizes.map((size) => (
                            <button
                              key={size.size_id._id}
                              onClick={() => handleSizeChange(size)}
                              className={`flex items-center justify-center rounded-lg h-10 text-sm shadow-md transition duration-200 px-2
                                ${
                                  selectedSize?.size_id._id === size.size_id._id
                                    ? "bg-[#ea8025] text-white border border-[#ea8025]"
                                    : "bg-white text-black border border-[#ea8025] hover:bg-[#ea8025] hover:text-white"
                                }`}
                              disabled={size.status === "unavailable"}
                            >
                              <span>{size.size_id.name}</span>
                              <span className="ml-2 text-sm">
                                + {listPrice(size.size_id.priceSize || 0)} VNĐ
                              </span>{" "}
                              {/* Hiển thị giá size */}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="px-6 text-gray-500">
                          Không có kích thước nào có sẵn.
                        </p>
                      )
                    ) : (
                      <p className="px-6 text-gray-500">
                        Vui lòng chọn một sản phẩm để xem kích thước.
                      </p>
                    )}

                    {/* Phần chọn topping */}
                    <div className="my-6">
                      <h2 className="font-medium text-lg mb-2">Chọn topping</h2>
                      {selectedProduct ? (
                        <form className="flex flex-col my-1 rounded-md">
                          {selectedProduct.product_toppings.map((topping) => {
                            return (
                              <div
                                key={topping.topping_id._id}
                                className="flex items-center gap-2 px-2 py-2 border-b border-gray-200"
                              >
                                <input
                                  type="checkbox"
                                  name="topping"
                                  checked={selectedToppings.includes(topping)}
                                  onChange={() => handleToppingChange(topping)}
                                  className="text-[#ea8025] border-[#ea8025] border-2 focus:ring-[#ea8025] focus:ring-opacity-50"
                                />
                                <label className="flex-1">
                                  {topping.topping_id.nameTopping}
                                  {topping.topping_id.priceTopping
                                    ? ` ( + ${listPrice(
                                        topping.topping_id.priceTopping
                                      )} VNĐ)`
                                    : null}
                                </label>
                              </div>
                            );
                          })}
                        </form>
                      ) : (
                        <p className="px-6 text-gray-500">
                          Không có topping nào có sẵn.
                        </p>
                      )}
                    </div>
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
                    value={quantity}
                    onChange={handleQuantityChange} // Gọi hàm khi số lượng thay đổi
                    className="w-16 mt-2 text-center rounded-md border-[#ea8025] shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="flex space-x-4 mb-6">
                  <button
                    onClick={() => {
                      console.log("Button clicked", selectedProduct?._id);
                      addToCart(product?._id);
                    }}
                    className="relative bg-white px-6 py-2 border border-[#ea8025] text-lg rounded-md transition duration-300 overflow-hidden focus:outline-none cursor-pointer group text-black font-semibold"
                  >
                    <span className="relative z-10 transition duration-300 group-hover:text-white">
                      <p className="text-base">Thêm giỏ hàng</p>
                    </span>
                    <span className="absolute inset-0 bg-[#ea8025] opacity-0  transform -translate-x-full transition-all duration-1000 group-hover:translate-x-0 group-hover:opacity-50"></span>
                    <span className="absolute inset-0 bg-[#ea8025] opacity-0  transform -translate-x-full transition-all duration-1000 group-hover:translate-x-0 group-hover:opacity-100"></span>
                  </button>
                  <button className="bg-[#ea8025] flex gap-2 items-center text-white px-6 py-2 rounded-md hover:bg-[#FF6600] focus:outline-none">
                    Mua ngay
                  </button>
                </div>
              </div>
            </div>
            <hr className="mb-4 mx-4" />
            <div className="mx-4">
              <h1 className="font-medium text-xl">Mô tả sản phẩm:</h1>
              <p
                className="text-gray-700 mb-4 mt-1"
                dangerouslySetInnerHTML={{ __html: product.description }}
              ></p>
            </div>
            <hr className="my-2 mx-4" />
            <div className="mx-4">
              <h1 className="my-2 font-medium text-xl">Sản phẩm khác</h1>
              <div className="flex">
                {products.slice(0, 6).map((item) =>
                  item._id !== product._id ? ( // Kiểm tra nếu id sản phẩm không phải là sản phẩm hiện tại
                    <div key={item._id} className="w-full">
                      <Link to={`/detail/${item._id}`}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-[160px] h-[160px] rounded-lg border-2 my-2"
                        />
                      </Link>
                      <Link to={`/detail/${item._id}`}>
                        <h3 className="mx-2">{item.name}</h3>
                      </Link>
                      <p className="mx-2 text-xs text-[#838080]">
                        {listPrice(item.price)} VNĐ
                      </p>
                    </div>
                  ) : null // Nếu là sản phẩm hiện tại thì không hiển thị gì cả
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DetailPage;
