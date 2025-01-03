/* eslint-disable @typescript-eslint/no-unused-vars */
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import instance from "../../services/api";
import { Product, ProductSize, ProductTopping } from "../../types/product";
import toast from "react-hot-toast";
import { Button } from "antd";
import { Comment } from "../../types/comment";
import { logo_Cozy } from "../../assets/img";

const DetailPage = () => {
	const storedUser = localStorage.getItem("user");
	const user = storedUser ? JSON.parse(storedUser) : null;
	const { id } = useParams<{ id: string }>();
	const [mainImage, setMainImage] = useState("");
	const [products, setProducts] = useState<Product[]>([]);
	const [quantity, setQuantity] = useState(1); // Thêm state cho số lượng

	// Size + Topping
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
	const [selectedToppings, setSelectedToppings] = useState<any>();
	const [replies, setReplies] = useState<Comment[]>([]);
	const [showReplies, setShowReplies] = useState<string | null>(null);

	console.log(selectedProduct);

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
		setSelectedToppings((prevToppings: ProductTopping[] | undefined) => {
			// Nếu topping đã có trong danh sách, thì xóa nó
			if (prevToppings?.some(t => t.topping_id === topping.topping_id)) {
				return prevToppings.filter(t => t.topping_id !== topping.topping_id);
			} else {
				// Nếu chưa có, thêm vào danh sách
				return [...(prevToppings || []), topping];
			}
		});
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
	const { data: comments } = useQuery({
		queryKey: ["comment", id],
		queryFn: async () => {
			if (!id) throw new Error("Thiếu Product ID");
			const response = await instance.get(`/comment/product/${id}`);
			return response.data;
		},
		enabled: !!id,
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
		quantity: number,
	) => {
		const totalPrice = (basePrice + sizePrice) * quantity;
		return totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	};

	const listPrice = (price: number) => {
		const totalPrice = price;
		return totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	};

	const handleQuantityChange = (
		eventOrValue: React.ChangeEvent<HTMLInputElement> | number,
	) => {
		let newQuantity;

		// Kiểm tra nếu đầu vào là sự kiện từ input
		if (typeof eventOrValue === "number") {
			newQuantity = eventOrValue;
		} else {
			newQuantity = parseInt(eventOrValue.target.value, 10);
		}

		// Đảm bảo số lượng không nhỏ hơn 1
		setQuantity(newQuantity >= 1 ? newQuantity : 1);
	};

	const calculateTotalPrice = () => {
		const basePrice = product?.sale_price || product?.price || 0; // Use sale_price if available
		const sizePrice = selectedSize?.size_id?.priceSize || 0;
		const toppingPrice =
			selectedToppings?.reduce(
				(acc: string, topping: ProductTopping) =>
					acc + (topping.priceTopping || 0),
				0,
			) || 0;

		return (basePrice + sizePrice + toppingPrice) * quantity;
	};

	const totalPrice = calculateTotalPrice();

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>An error occurred: {(error as Error).message}</div>;
	//add To Cart
	const addToCart = async (productId: string) => {
		if (!productId) {
			return toast.error(
				"Vui lòng đăng nhập tài khoản hoặc chọn sản phẩm hợp lệ",
			);
		}

		// Check if a size has been selected
		if (!selectedSize) {
			return toast.error("Vui lòng chọn size.");
		}

		try {
			const payload = {
				userId: user._id,
				productId,
				quantity,
				productSizes: selectedSize?.size_id || null,
				productToppings:
					selectedToppings?.map((t: ProductTopping) => t.topping_id) || [],
			};
			console.log(
				"Mapped Toppings (productToppings):",
				selectedToppings?.map((t: ProductTopping) => t.topping_id) || [],
			);
			console.log("Payload gửi lên:", payload);

			// Gửi request thêm vào giỏ hàng
			const { data } = await instance.post("/cart", payload);

			toast.success(data.messsage || "Thêm thành công");
		} catch (error) {
			toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng");
		}
	};

	const fetchReplies = async (parentId: string) => {
		const response = await instance.get(`/comment/parent/${parentId}`);
		return response.data;
	};

	const handleToggleReplies = async (parentId: string) => {
		if (showReplies === parentId) {
			setShowReplies(null); // Hide replies if already shown
		} else {
			const fetchedReplies = await fetchReplies(parentId);
			setReplies(fetchedReplies);
			setShowReplies(parentId); // Show replies for this comment
		}
	};

	return (
    <>
      {product && (
        <div>
          <div className="containerAll mt-[60px] py-8 md:mx-auto md:px-4">
            <div className="py-4 px-4 border-b-2 md:px-0 md:border">
              <div className="flex flex-wrap mx-0 md:mx-4 my-2">
                {/* Product Images */}
                <div className="w-full mb-4 p-0 md:w-2/5 md:px-4">
                  <img
                    src={mainImage}
                    alt="Product"
                    className="w-[390px] h-[360px] md:w-[480px] md:h-[409px] mx-auto bg-cover rounded-lg border-2 shadow-md mb-4"
                  />
                  <div className="flex gap-4 justify-center overflow-x-auto">
                    {/* Thumbnails */}
                    <img
                      src={product.image} // Hiển thị ảnh chính trong thumbnail
                      alt="Main Product Thumbnail"
                      className="w-[75px] h-[75px] md:w-20 md:h-20 object-cover rounded-md cursor-pointer opacity-60 hover:opacity-100 transition duration-300 border-2"
                      onClick={() => changeImage(product.image)} // Có thể click để xem ảnh chính
                    />
                    {Array.isArray(product.thumbnail) &&
                      product.thumbnail.slice(0, 4).map((thumb, index) => (
                        <img
                          key={index}
                          src={thumb}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-[75px] h-[75px] md:w-20 md:h-20 object-cover rounded-md cursor-pointer opacity-60 hover:opacity-100 transition duration-300 border-2"
                          onClick={() => changeImage(thumb)} // Thay đổi ảnh chính khi nhấp vào thumbnail
                        />
                      ))}
                  </div>
                </div>

                {/* Product Info */}
                <div className="w-full px-0 md:px-4 md:w-3/5">
                  <h2 className="mt-2 text-lg font-semibold md:font-bold mb-2 md:mt-0 md:text-4xl">
                    {product.name}
                  </h2>
                  <div className="mb-4 flex items-center">
                    {product.sale_price &&
                    product.sale_price < product.price ? (
                      <div className="flex items-center gap-2">
                        <p className="text-2xl md:text-lg text-gray-500 italic line-through font-medium mr-2">
                          {new Intl.NumberFormat("vi-VN").format(product.price)}{" "}
                          VNĐ
                        </p>
                        <p className="text-2xl md:text-lg text-[#ea8025] font-semibold mr-2">
                          {new Intl.NumberFormat("vi-VN").format(totalPrice)}{" "}
                          VNĐ
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-end gap-1 py-1">
                        <p className="text-2xl md:text-lg text-[#ea8025] font-semibold mr-2">
                          {new Intl.NumberFormat("vi-VN").format(totalPrice)}{" "}
                          VNĐ
                        </p>
                      </div>
                    )}
                  </div>

                  <hr className="hidden md:block mb-3" />
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

                      {selectedProduct?.product_toppings?.length > 0 && (
                        <div className="space-y-4 mt-4">
                          <h2 className="text-lg font-semibold">
                            Chọn topping
                          </h2>
                          <div className="grid grid-cols-2 gap-4">
                            {selectedProduct?.product_toppings.map(
                              (topping) => (
                                <label
                                  key={topping?.topping_id?._id}
                                  className={`
            border rounded-lg p-3 flex items-center justify-between cursor-pointer
            ${
              selectedToppings?.some((t) => t.topping_id === topping.topping_id)
                ? "border-[#ea8025] bg-[#ea8025]/10"
                : "border-gray-200"
            }
            ${topping?.stock <= 0 ? "opacity-50 cursor-not-allowed" : ""}
          `}
                                >
                                  <div className="flex items-center space-x-3">
                                    <input
                                      type="checkbox"
                                      checked={selectedToppings?.some(
                                        (t) =>
                                          t.topping_id === topping.topping_id
                                      )}
                                      onChange={() =>
                                        handleToppingChange(topping)
                                      }
                                      disabled={topping?.stock <= 0}
                                      className="form-checkbox text-[#ea8025] rounded focus:ring-[#ea8025]"
                                    />
                                    <span className="text-gray-700">
                                      {topping?.topping_id?.nameTopping}
                                    </span>
                                  </div>
                                  <span className="text-[#ea8025] font-semibold">
                                    {topping?.priceTopping
                                      ? `+${listPrice(topping?.priceTopping)} đ`
                                      : ""}
                                  </span>
                                </label>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-6 sm:mb-8 md:mb-10">
                    <label
                      htmlFor="quantity"
                      className="block text-lg font-medium text-gray-700 mb-1 sm:mb-2"
                    >
                      Số lượng:
                    </label>
                    <div className="mt-4 flex items-center justify-between gap-6 md:order-3 md:mt-0">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleQuantityChange(quantity - 1)}
                          className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
                          disabled={quantity <= 1}
                        >
                          -
                        </button>
                        <input
                          value={quantity}
                          readOnly
                          className="w-12 h-10 text-center bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                        />
                        <button
                          onClick={() => handleQuantityChange(quantity + 1)}
                          className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4 mb-6">
                    {product?.isDeleted === false &&
                    product?.status === "unavailable" ? (
                      <p className="bg-red-100 border-l-4 border-[#ea8025] text-red-600 font-semibold py-2 px-4 rounded-md shadow-md">
                        Sản phẩm này đã hết hàng. Bạn có thể chọn sản phẩm khác
                        để mua.
                      </p>
                    ) : (
                      <button
                        onClick={() => {
                          if (user?.role !== "admin") {
                            addToCart(product?._id);
                          } else {
                            console.log("Admin không thể thêm vào giỏ hàng");
                          }
                        }}
                        className="relative bg-white px-6 py-2 border border-[#ea8025] text-lg rounded-md transition duration-300 overflow-hidden focus:outline-none cursor-pointer group text-black font-semibold"
                      >
                        {user ? (
                          user?.role !== "admin" ? (
                            <span className="relative z-10 transition duration-300 group-hover:text-white">
                              <p className="text-base">Thêm giỏ hàng</p>
                            </span>
                          ) : (
                            <span className="relative z-10 transition duration-300 text-red-600">
                              <p className="text-base">
                                Vui lòng đăng nhập tài khoản người dùng
                              </p>
                            </span>
                          )
                        ) : (
                          <span className="relative z-10 transition duration-300 text-red-600">
                            <p className="text-base">
                              Bạn chưa đăng nhập. Vui lòng đăng nhập để mua
                              hàng.
                            </p>
                          </span>
                        )}

                        <span className="absolute inset-0 bg-[#ea8025] opacity-0 transform -translate-x-full transition-all duration-1000 group-hover:translate-x-0 group-hover:opacity-50"></span>
                        <span className="absolute inset-0 bg-[#ea8025] opacity-0 transform -translate-x-full transition-all duration-1000 group-hover:translate-x-0 group-hover:opacity-100"></span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="mx-0 md:mx-4">
                <h1 className="font-medium text-xl">Mô tả sản phẩm:</h1>
                {product.description ? (
                  <p
                    className="text-md md:text-lg text-gray-700 mb-4 mt-1"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  ></p>
                ) : (
                  <p className="text-md md:text-lg text-gray-700 mb-4 mt-1">
                    Không có mô tả cho sản phẩm này.
                  </p>
                )}
              </div>
            </div>
            <div className="my-2  md:my-2 md:px-0">
              <div className="px-[15px] border space-y-6 md:p-6">
                <h1 className="text-2xl font-semibold">Nội dung đánh giá</h1>
                <div className="max-h-[600px] overflow-auto">
                  {comments?.map((review: Comment) => (
                    <div
                      key={review._id}
                      className="flex space-x-4 items-start border-b pb-4"
                    >
                      {/* Avatar của người bình luận */}
                      {review.user_id.avatars[0].url === "" ? (
                        <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                      ) : (
                        <img
                          src={review.user_id.avatars[0].url}
                          alt="Reviewer Avatar"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}

                      <div className="flex-1">
                        {/* Thông tin người dùng */}
                        <p className="font-bold">
                          {review.user_id?.userName || "Ẩn danh"}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Ngày bình luận:{" "}
                          {new Date(review.createdAt).toLocaleString("vi-VN", {
                            dateStyle: "short",
                            timeStyle: "short",
                            timeZone: "Asia/Ho_Chi_Minh",
                          })}
                        </p>

                        {/* Nội dung bình luận */}
                        <p className="mt-2 text-sm">
                          {review.content || "Không có nội dung bình luận."}
                        </p>

                        {/* Hình ảnh bình luận */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {review.image?.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Review Image ${idx + 1}`}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ))}
                        </div>

                        {/* Phần phản hồi */}
                        {showReplies === review._id && (
                          <div className="mt-4 pl-6">
                            {replies.map((reply) => (
                              <div
                                key={reply._id}
                                className="flex items-start space-x-4"
                              >
                                {/* Avatar phản hồi */}
                                <div>
                                  <img
                                    className="w-[40px] h-[40px] border border-black rounded-full"
                                    src={logo_Cozy}
                                    alt="Logo"
                                  />
                                </div>
                                <div className="flex-1 mt-[10px]">
                                  <h2 className="font-medium">COZY HAVEN</h2>
                                  <p className="text-sm ml-3">
                                    {reply.content ||
                                      "Không có nội dung phản hồi."}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Nút hiển thị/ẩn phản hồi */}
                        <Button
                          type="link"
                          onClick={() => handleToggleReplies(review._id)}
                          className="text-blue-500"
                        >
                          {showReplies === review._id
                            ? "Ẩn phản hồi"
                            : "Xem phản hồi"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t-2 px-4 md:border md:my-2">
              <div className="mx-0 md:mx-4 ">
                <h1 className="text-lg mb-[2px] md:my-2 font-medium md:text-xl">
                  Sản phẩm khác
                </h1>
                <div className="flex flex-wrap justify-center md:grid md:grid-cols-6 gap-x-4">
                  {products.slice(0, 6).map((item) =>
                    item._id !== product._id ? (
                      <div
                        key={item._id}
                        className="px-[1.5px] md:p-2 flex flex-col items-center"
                      >
                        <Link to={`/detail/${item._id}`}>
                          <div className="w-full max-w-[150px] aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300 my-2">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </Link>
                        <Link to={`/detail/${item._id}`}>
                          <h3 className="text-sm font-semibold text-gray-800 text-center line-clamp-1 max-w-[190px] md:max-w-[250px]">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-[#838080] text-center">
                          {listPrice(item.price)} VNĐ
                        </p>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DetailPage;
