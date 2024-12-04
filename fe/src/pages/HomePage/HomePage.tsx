import { Link } from "react-router-dom";
import Homes from "../../components/Homes";
import React, { useState, useEffect } from "react";
import instance from "../../services/api";
import { Product, ProductSize } from "../../types/product";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Drawer, Modal } from "flowbite-react";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { Banner } from "../../types/banner";
const HomePage: React.FC = () => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser!) : {};
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<any | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<any[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);
  // slideShow
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024, // Với màn hình dưới 1024px
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 768, // Với màn hình dưới 768px
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480, // Với màn hình dưới 480px
        settings: {
          slidesToShow: 2, // Hiển thị 1 sản phẩm trên màn hình nhỏ
          slidesToScroll: 1,
        },
      },
    ],
  };

  //showProduct

  // const [loading, setLoading] = useState(true); // State kiểm soát việc hiển thị trạng thái loading
  const dataLocal = localStorage.getItem("W209_USER_INFO");
  const [dataLocalStorage, setDataLocalStorage] = useState("");
  useEffect(() => {
    if (dataLocal) {
      const newData = JSON.parse(dataLocal);
      setDataLocalStorage(newData);
    }
  }, []);
  const fetchData = async () => {
    try {
      const [productsResponse] = await Promise.all([instance.get("/products")]);
      setProducts(productsResponse.data.data);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const {
    data: banners,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      try {
        const response = await instance.get("banners");
        return response.data;
      } catch (error) {
        throw new Error("Lỗi khi tải danh sách banner");
      }
    },
  });

  const images: string[] = banners?.data
    ? banners.data.map((banner: Banner) => banner.imageBanner).slice(2, 5)
    : [];

  const [bannerFull, bannerApp] = [
    banners?.data?.[0]?.imageBanner || null,
    banners?.data?.[1]?.imageBanner || null,
  ];
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000); // Thay đổi 3000 thành khoảng thời gian bạn muốn giữa các hình ảnh

    return () => clearInterval(interval);
  }, [currentIndex, images.length]);
  // Định dạng số
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  const inFormatPrice = (
    basePrice: number,
    sizePrice: number,
    quantity: number
  ) => {
    const totalPrice = (basePrice + sizePrice) * quantity;
    return totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleCloseModal = () => {
    setSelectedSize(null);
    setSelectedToppings([]);
    setQuantity(1);
    setTotalPrice(0);
    setIsModalOpen(false);
  };

  // Cập nhật khi mở modal với sản phẩm mới
  const toggleModal = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSize(null);
    setSelectedToppings([]);
    setQuantity(1);
    setTotalPrice(product.price);
    setIsModalOpen(!isModalOpen);
  };
  const handleSizeChange = (size: ProductSize) => {
    setSelectedSize(size); // Cập nhật kích thước đã chọn
  };

  // Modal
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);

  const handleIncrement = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };
  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prevQuantity) => prevQuantity - 1);
    }
  };
  useEffect(() => {
    if (selectedProduct && selectedSize) {
      const basePrice = selectedProduct.price;
      const sizePrice = selectedSize.priceSize || 0;
      const toppingPrice = selectedToppings.reduce(
        (total, topping) => total + (topping.topping_id.priceTopping || 0),
        0
      );

      const total = (basePrice + sizePrice + toppingPrice) * quantity;
      console.log({ basePrice, sizePrice, toppingPrice, total });
      setTotalPrice(total);
    }
  }, [quantity, selectedSize, selectedToppings, selectedProduct]);

  const addToCart = async (productId: string) => {
    if (!productId) {
      return toast.error(
        "Vui lòng đăng nhập tài khoản hoặc chọn sản phẩm hợp lệ"
      );
    }

    if (!selectedSize) {
      return toast.error("Vui lòng chọn Size");
    }

    // Check if the product already exists in the cart (localStorage)
    const cartData = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingProductIndex = cartData.findIndex(
      (item: any) =>
        item.productId === productId &&
        item.productSizes === selectedSize.size_id &&
        JSON.stringify(item.productToppings.sort()) ===
        JSON.stringify(
          selectedToppings.map((topping) => topping.topping_id._id).sort()
        ) // Match toppings as well
    );

    if (existingProductIndex !== -1) {
      // If the product exists in the cart, update the quantity
      cartData[existingProductIndex].quantity += quantity;
      cartData[existingProductIndex].quantity = Math.max(
        1,
        cartData[existingProductIndex].quantity
      ); // Ensure quantity is at least 1

      localStorage.setItem("cart", JSON.stringify(cartData));
      toast.success("Sản phẩm đã được thêm vào giỏ hàng");
    } else {
      // If the product is not in the cart, add it
      const newItem = {
        userId: user._id,
        productId,
        quantity: quantity,
        productSizes: selectedSize.size_id,
        productToppings: selectedToppings.map(
          (topping) => topping.topping_id._id
        ),
      };

      try {
        await instance.post("/cart", newItem); // Send new product to the backend
        cartData.push(newItem); // Also update the local storage cart
        localStorage.setItem("cart", JSON.stringify(cartData));
        toast.success("Sản phẩm đã được thêm vào giỏ hàng");
      } catch (error) {
        toast.error("Lỗi khi thêm vào giỏ hàng");
      }
    }

    setIsModalOpen(false); // Close the modal after adding to the cart
  };

  const handleToppingChange = (topping: any) => {
    setSelectedToppings((prevToppings) => {
      const currentToppings = Array.isArray(prevToppings) ? prevToppings : [];

      const isSelected = currentToppings.some(
        (t) => t.topping_id._id === topping.topping_id._id
      );

      if (isSelected) {
        return currentToppings.filter(
          (t) => t.topping_id._id !== topping.topping_id._id
        );
      } else {
        return [...currentToppings, topping];
      }
    });
  };

  useEffect(() => {
    if (selectedProduct && selectedSize) {
      const basePrice = selectedProduct.price;
      const sizePrice = selectedSize.priceSize || 0;
      const toppingPrice = selectedToppings.reduce(
        (total, topping) => total + (topping.price || 0),
        0
      );

      // Tính lại tổng giá trị giỏ hàng
      const total = (basePrice + sizePrice + toppingPrice) * quantity;
      setTotalPrice(total);
    }
  }, [quantity, selectedSize, selectedToppings, selectedProduct]);

  useEffect(() => {
    console.log({ selectedSize, selectedToppings });
  }, [selectedSize, selectedToppings]);

  if (isLoading) {
    return <p>Đang tải banner...</p>;
  }

  if (error) {
    return <p>Lỗi khi tải banner: {error.message}</p>;
  }

  return (
    <>
      <div>
        <img
          src={images[currentIndex]}
          alt="Banner"
          className="w-full h-52 mt-[65px] object-cover md:mt-12 md:h-[480px]"
        />
        <div className="containerAll mx-auto overflow-hidden home">
          <h1 className="font-medium text-lg py-1 mx-4 md:py-3 md:mx-0 md:font-semibold md:text-3xl">
            Sản Phẩm Hot
          </h1>
          <div className="flex flex-wrap gap-0 text-left h-auto md:flex-row md:gap-6 md:h-[330px]">
            <div className="cow_left mx-4 md:mx-0">
              {bannerApp && (
                <img
                  src={bannerApp}
                  alt="Banner 5"
                  className="border w-[542px] h-[200px] rounded-[10px] object-cover md:w-[542px] md:h-[333px] md:mb-0 mb-4"
                />
              )}
            </div>
            {products.slice(0, 2).map((product: Product) => (
              <div className="item mx-auto md:mx-0" key={product._id}>
                <div className="relative  group place-items-center md:product_img">
                  <Link to={`detail/${product._id}`}>
                    <img
                      src={`${product.image}`}
                      alt=""
                      className="w-[180px] h-[180px] object-cover rounded-[10px] shadow-3xl border-2 md:h-[250px] md:w-[260px]"
                    />
                  </Link>
                  {product.status === "available" && user?.role !== "admin" ? (
                    <div className="hidden md:block">
                      <button
                        key={product._id}
                        onClick={() => toggleModal(product)}
                        className="absolute scale-0 group-hover:scale-100 duration-200 z-[2] lg:w-[152px] mb:w-[136px] lg:h-[64px] mb:h-[48px] rounded-[100px] border-none bg-[#1A1E2630] text-sm text-white backdrop-blur-md 
                          left-[50%] top-[37%] transform -translate-x-1/2 flex items-center justify-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="size-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                          />
                        </svg>{" "}
                        Mua ngay
                      </button>
                    </div>
                  ) : (
                    <button
                      className="absolute scale-0 group-hover:scale-100 duration-200 z-[2] lg:w-[152px] mb:w-[136px] lg:h-[64px] mb:h-[48px] rounded-[100px] border-none bg-[#1A1E2630] text-sm text-white backdrop-blur-md 
                          left-[44%] top-[43%] transform -translate-x-1/2 flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                        />
                      </svg>{" "}
                      {user?.role === "admin" ? "" : "Hết Hàng"}
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="">
                    <Link to={`detail/${product._id}`}>
                      <h3 className="">{product.name}</h3>
                    </Link>
                    <p>{formatPrice(product.price)} VNĐ </p>
                  </div>
                  <div className="">
                    <i className="text-sm">
                      {product.status === "available" ? (
                        ""
                      ) : (
                        <span className="text-red-500">Hết hàng</span>
                      )}
                    </i>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="my-4"></div>
          {/* 4 sản phầm HOT */}
          {products.length > 3 ? (
            <Slider {...settings}>
              {products.slice(0, 10).map((product: Product, index) => (
                <div className="flex mx-2 md:mx-0">
                  <div key={`${product._id}-${index}`} className="item md:mx-1 mx-2">
                    <div className="my-4">
                      <div className="relative group w-[180px] mb-2 rounded-xl  md:w-[300px]">
                        <Link to={`detail/${product._id}`}>
                          <img
                            src={`${product.image}`}
                            alt=""
                            className="w-[180px] h-[180px] object-cover rounded-[10px] shadow-3xl border-2 md:h-[250px] md:w-[260px]"
                          />
                        </Link>
                        {product.status === "available" &&
                          user?.role !== "admin" ? (
                          <div className="hidden md:block">
                            <button
                              key={product._id}
                              onClick={() => toggleModal(product)}
                              className="absolute scale-0 group-hover:scale-100 duration-200 z-[2] lg:w-[152px] mb:w-[136px] lg:h-[64px] mb:h-[48px] rounded-[100px] border-none bg-[#1A1E2630] text-sm text-white backdrop-blur-md 
                          left-[44%] top-[43%] transform -translate-x-1/2 flex items-center justify-center"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="size-5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                                />
                              </svg>{" "}
                              Mua ngay
                            </button>
                          </div>
                        ) : (
                          <button
                            className="absolute scale-0 group-hover:scale-100 duration-200 z-[2] lg:w-[152px] mb:w-[136px] lg:h-[64px] mb:h-[48px] rounded-[100px] border-none bg-[#1A1E2630] text-sm text-white backdrop-blur-md 
                          left-[44%] top-[43%] transform -translate-x-1/2 flex items-center justify-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              className="size-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                              />
                            </svg>{" "}
                            Hết Hàng
                          </button>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="">
                            <Link to={`detail/${product._id}`}>
                              <h3 className="">{product.name}</h3>
                            </Link>
                            <p>{formatPrice(product.price)} VNĐ </p>
                          </div>
                          <div className="">
                            <i className="text-sm mr-5 md:mr-2">
                              {product.status === "available" ? (
                                <div className="hidden md:block">
                                  <button
                                    key={product._id}
                                    onClick={() => toggleModal(product)}
                                    className="absolute scale-0 group-hover:scale-100 duration-200 z-[2] lg:w-[152px] mb:w-[136px] lg:h-[64px] mb:h-[48px] rounded-[100px] border-none bg-[#1A1E2630] text-sm text-white backdrop-blur-md 
                                left-[50%] top-[37%] transform -translate-x-1/2 flex items-center justify-center"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth="1.5"
                                      stroke="currentColor"
                                      className="size-5"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                                      />
                                    </svg>
                                    Mua ngay
                                  </button>
                                </div>
                              ) : (
                                <span className="text-red-500">Hết hàng</span>
                              )}
                            </i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          ) : (
            <div className="flex flex-wrap gap-y-4 md:mx-0 md:mt-0">
              {products.map((product: Product, index) => (
                <div
                  key={`${product._id}-${index}`}
                  className="item mx-[1px] md:mx-2"
                >
                  <div className="mx-4 md:mx-0 md:my-4">
                    <Link
                      to={`detail/${product._id}`}
                      className="overflow-hidden rounded-lg shadow-lg"
                    >
                      <img
                        src={`${product.image}`}
                        alt=""
                        className="w-[180px] h-[180px] object-cover rounded-[10px] shadow-3xl border-2  md:h-[250px] md:w-[260px]"
                      />
                    </Link>
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="">
                          <Link to={`detail/${product._id}`}>
                            <h3 className="">{product.name}</h3>
                          </Link>
                          <p className="">{formatPrice(product.price)} VNĐ </p>
                        </div>
                        <div className="">
                          <i className="text-sm">
                            {product.status === "available" ? (
                              ""
                            ) : (
                              <span className="text-red-500">Hết hàng</span>
                            )}
                          </i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/*  */}
          <div className="banner-mid mt-0 md:mt-6 md:mb-9 relative">
            <img
              src={bannerFull}
              className="h-52 object-cover md:h-[600px] "
              alt="Banner 3"
            />
            <Link
              className="absolute bottom-1 md:mx-0 w-full md:bottom-14 md:right-4  block md:w-[535px] bg-[#778B37] text-center text-white text-[16px] leading-[40px] px-[15px] font-semibold rounded-lg"
              to="/menu"
              target="_blank"
              title="Thử ngay"
            >
              <span>Thử ngay</span>
            </Link>
          </div>
        </div>
        <Homes />
      </div>
      {/* Mua ngay */}
      <Drawer open={isOpen} onClose={handleClose}>
        {/* <Drawer.Header title="Cart" /> */}
        <Drawer.Items>
          {isModalOpen && selectedProduct && (
            <Modal show={isModalOpen} onClose={handleCloseModal}>
              <Modal.Header className="relative h-0 top-5 text-black p-0 mr-2 border-none"></Modal.Header>
              <Modal.Body className="bg-gray-100">
                <div className="flex gap-3">
                  <div className="w-[170px]">
                    <img
                      src={selectedProduct.image}
                      alt="Ảnh sản phẩm"
                      className="w-[160px] h-[160px] rounded-xl"
                    />
                  </div>
                  <div className="w-max flex-1">
                    <h1 className="text-lg font-medium">
                      {selectedProduct?.name}
                    </h1>

                    {/* Hiển thị giá */}
                    {selectedProduct?.sale_price &&
                      selectedProduct?.sale_price < selectedProduct?.price ? (
                      <div className="flex items-center gap-2">
                        <p className="text-sm line-through text-gray-500">
                          {formatPrice(selectedProduct?.price)}{" "}
                          {/* Giá gốc bị gạch bỏ */}
                        </p>
                        <p className="text-sm text-[#ea8025] font-semibold">
                          {formatPrice(selectedProduct?.sale_price)} VNĐ{" "}
                          {/* Giá giảm */}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-end gap-1 py-1">
                        <p className="text-sm text-[#ea8025] font-medium">
                          {formatPrice(selectedProduct?.price)}
                        </p>
                        <p className="text-[10px] text-[#ea8025] font-medium">
                          VNĐ
                        </p>
                      </div>
                    )}

                    <i
                      className="text-sm text-black"
                      dangerouslySetInnerHTML={{
                        __html: selectedProduct.description,
                      }}
                    ></i>

                    <div className="flex gap-10 items-center py-4">
                      <form className="max-w-xs py-1">
                        <div className="relative flex items-center">
                          <button
                            type="button"
                            onClick={handleDecrement}
                            className="flex-shrink-0 bg-[#ea8025] inline-flex items-center justify-center border border-[#ea8025] rounded-2xl h-5 w-5 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none"
                          >
                            <svg
                              className="w-2.5 h-2.5 text-white"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 18 2"
                            >
                              <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M1 1h16"
                              />
                            </svg>
                          </button>
                          <input
                            type="text"
                            id="counter-input"
                            value={quantity}
                            readOnly
                            className="flex-shrink-0 text-gray-900 dark:text-white border-0 bg-transparent text-sm font-normal focus:outline-none focus:ring-0 max-w-[2.5rem] text-center"
                          />
                          <button
                            type="button"
                            onClick={handleIncrement}
                            className="flex-shrink-0 bg-[#ea8025] inline-flex items-center justify-center border border-[#ea8025] rounded-2xl h-5 w-5 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none"
                          >
                            <svg
                              className="w-2.5 h-2.5 text-white"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 18 18"
                            >
                              <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 1v16M1 9h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </form>

                      <button className="bg-[#ea8025] border-[#ea8025] text-white border-2 h-[30px] px-3 rounded-2xl transform transition-transform duration-500 hover:scale-105">
                        {inFormatPrice(
                          selectedProduct.sale_price,
                          selectedSize?.size_id.priceSize || 0,
                          quantity
                        )}
                        VNĐ
                      </button>
                    </div>
                  </div>
                </div>

                {/* Size Selection */}
                <div className="my-3">
                  <h2 className="font-medium px-6">Chọn size</h2>
                  <form className="flex justify-between bg-white shadow-xl my-1 rounded-md">
                    {selectedProduct.product_sizes.map((size) => {
                      return (
                        <div className="flex items-center gap-2 px-6 py-2">
                          <input
                            key={size?.size_id?._id}
                            type="radio"
                            name="size"
                            checked={selectedSize === size}
                            onChange={() => handleSizeChange(size)}
                            disabled={size.status === "unavailable"}
                            className="text-[#ea8025] border-[#ea8025] border-2"
                          />
                          <label htmlFor="">{size.size_id.name}</label>
                        </div>
                      );
                    })}
                  </form>
                </div>

                {/* Topping Selection */}
                <div className="">
                  <h2 className="font-medium px-6">Topping</h2>
                  <form className="bg-white shadow-xl my-1 rounded-md">
                    {selectedProduct.product_toppings.length === 0 ? (
                      <p className="px-6 py-2 text-gray-500">
                        Không có topping
                      </p> // Hiển thị thông báo nếu không có topping
                    ) : (
                      selectedProduct.product_toppings.map((topping) => (
                        <div
                          key={topping?.topping_id?._id}
                          className="flex items-center gap-2 px-6 py-2"
                        >
                          <input
                            type="checkbox"
                            name="topping"
                            checked={selectedToppings.some(
                              (selectedTopping) =>
                                selectedTopping.topping_id._id ===
                                topping.topping_id._id
                            )}
                            onChange={() => handleToppingChange(topping)}
                            className="text-[#ea8025] border-[#ea8025] border-2 focus:ring-[#ea8025] focus:ring-opacity-50"
                          />
                          <label>
                            {topping?.topping_id?.nameTopping}{" "}
                            {topping?.priceTopping &&
                              `(+${topping?.priceTopping} đ)`}
                          </label>
                        </div>
                      ))
                    )}
                  </form>
                </div>

                <div className="flex mt-4">
                  <button
                    onClick={() => {
                      addToCart(selectedProduct?._id);
                    }}
                    className="relative bg-white  px-6 py-2 border border-[#ea8025] text-lg rounded-md transition duration-300 overflow-hidden focus:outline-none cursor-pointer group text-black font-semibold"
                  >
                    <span className="relative z-10 transition duration-300 group-hover:text-white">
                      <p className="text-base">Thêm giỏ hàng</p>
                    </span>
                    <span className="absolute inset-0 bg-[#ea8025] opacity-0  transform -translate-x-full transition-all duration-1000 group-hover:translate-x-0 group-hover:opacity-50"></span>
                    <span className="absolute inset-0 bg-[#ea8025] opacity-0  transform -translate-x-full transition-all duration-1000 group-hover:translate-x-0 group-hover:opacity-100"></span>
                  </button>
                </div>
              </Modal.Body>
            </Modal>
          )}
        </Drawer.Items>
      </Drawer>
    </>
  );
};

export default HomePage;
