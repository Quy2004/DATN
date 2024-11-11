import { Link } from "react-router-dom";
import Homes from "../../components/Homes";
import React, { useState, useEffect } from 'react';
import instance from "../../services/api";
import { Product, ProductSize, ProductTopping } from "../../types/product";
import Slider from "react-slick"
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Drawer, Modal } from "flowbite-react";
import toast from "react-hot-toast";
const HomePage: React.FC = () => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser!) : {};
  // slideShow
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const images: string[] = [
    "/src/assets/images/banner/Banner_1.webp",
    "/src/assets/images/banner/Banner_2.webp",
    "/src/assets/images/banner/Banner_3.webp"

  ]; // Thêm các hình ảnh bạn muốn sử dụng ở đây
  let settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1
  };
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000); // Thay đổi 3000 thành khoảng thời gian bạn muốn giữa các hình ảnh

    return () => clearInterval(interval);
  }, [currentIndex, images.length]);
  //showProduct
  const [products, setProducts] = useState([]); // State lưu danh sách sản phẩm
  // const [loading, setLoading] = useState(true); // State kiểm soát việc hiển thị trạng thái loading
  const dataLocal = localStorage.getItem('W209_USER_INFO');
  const [dataLocalStorage, setDataLocalStorage] = useState('')
  useEffect(() => {
    if (dataLocal) {
      const newData = JSON.parse(dataLocal)
      setDataLocalStorage(newData);
    }
  }, [])
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
  // Định dạng số
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  const inFormatPrice = (basePrice: number, sizePrice: number, quantity: number) => {
    const totalPrice = (basePrice + sizePrice) * quantity;
    return totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<ProductTopping[]>([]);
  const toggleModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(!isModalOpen);
  };
  const handleSizeChange = (size: ProductSize) => {
    setSelectedSize(size); // Cập nhật kích thước đã chọn
  };

  const handleToppingChange = (topping: ProductTopping) => {
    setSelectedToppings((prev) =>
      prev.includes(topping) ? prev.filter((top) => top !== topping) : [...prev, topping]
    );
  };
  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Vui lòng chọn size cho sản phẩm.");
      return;
    }
    // Logic thêm sản phẩm vào giỏ hàng...
    setIsModalOpen(false);
  };
  // Modal
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  // Tăng giảm số lượng
  const [quantity, setQuantity] = useState(1);
  const handleIncrement = () => {
    setQuantity(prevQuantity => prevQuantity + 1);
  };
  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prevQuantity => prevQuantity - 1);
    }
  };
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
        quantity: 1,
      });
      toast.success(data.messsage || "Thêm thành công");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng");
    }
  };
  return (

    <>
      <div >
        <img src={images[currentIndex]} alt="" className="w-max" />
        <div className='containerAll mx-auto home'>
          <h1 className='font-semibold text-3xl p-3'>Sản Phẩm Hot</h1>
          <div className='row grid grid-cols-4 gap-6 text-left h-[330px]'>
            <div className="cow_left col-span-2">
              <img src="/src/assets/images/banner/banner4.jpg" alt="" className="mb-10 " />
            </div>
            <div className="cow_right col-span-2 flex gap-6 h-[330px]">
              {products.slice(0, 2).map((product: Product) => (
                <div className="item" key={product._id}>
                  <div className="relative product_img group place-items-center">
                    <img src={`${product.image}`} alt="" className="h-[250px] w-[260px] object-cover rounded-[10px] shadow-3xl border-2" />
                    {
                      product.status === 'available' ? (
                        <button key={product._id} onClick={() => toggleModal(product)}
                          className="absolute scale-0 group-hover:scale-100 duration-200 z-[2] lg:w-[152px] mb:w-[136px] lg:h-[64px] mb:h-[48px] rounded-[100px] border-none bg-[#1A1E2630] text-sm text-white backdrop-blur-md 
                          left-[50%] top-[37%] transform -translate-x-1/2 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                          </svg> Mua ngay
                        </button>
                      ) : (
                        <button
                          className="absolute scale-0 group-hover:scale-100 duration-200 z-[2] lg:w-[152px] mb:w-[136px] lg:h-[64px] mb:h-[48px] rounded-[100px] border-none bg-[#1A1E2630] text-sm text-white backdrop-blur-md 
                          left-[44%] top-[43%] transform -translate-x-1/2 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                          </svg> Hết Hàng
                        </button>
                      )
                    }
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="">
                      <Link to={`detail/${product._id}`}>
                        <h3 className="">{product.name}</h3>
                      </Link>
                      <p>{formatPrice(product.price)} VNĐ </p>
                    </div>
                    <div className="">
                      <i className='text-sm'>
                        {product.status === 'available' ? '' : <span className="text-red-500">Hết hàng</span>}
                      </i>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="my-4"></div>
          {/* 4 sản phầm HOT */}
          {products.length > 3 ? (
            <Slider {...settings}>
              {products.slice(0,10).map((product: Product, index) => (
                <div className="flex md:mx-0">
                  <div key={`${product._id}-${index}`} className="item mx-2" >
                    <div className="my-4">
                      <div className="relative group w-[300px] mb-2 rounded-xl place-items-center">
                        <img src={`${product.image}`} alt="" className="h-[250px] w-[260px] object-cover rounded-[10px] shadow-3xl border-2" />
                        {
                          product.status === 'available' ? (
                            <button key={product._id} onClick={() => toggleModal(product)}
                              className="absolute scale-0 group-hover:scale-100 duration-200 z-[2] lg:w-[152px] mb:w-[136px] lg:h-[64px] mb:h-[48px] rounded-[100px] border-none bg-[#1A1E2630] text-sm text-white backdrop-blur-md 
                          left-[44%] top-[43%] transform -translate-x-1/2 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                              </svg> Mua ngay
                            </button>
                          ) : (
                            <button
                              className="absolute scale-0 group-hover:scale-100 duration-200 z-[2] lg:w-[152px] mb:w-[136px] lg:h-[64px] mb:h-[48px] rounded-[100px] border-none bg-[#1A1E2630] text-sm text-white backdrop-blur-md 
                          left-[44%] top-[43%] transform -translate-x-1/2 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                              </svg> Hết Hàng
                            </button>
                          )
                        }
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
                            <i className='text-sm mr-2'>
                              {product.status === 'available' ? '' : <span className="text-red-500">Hết hàng</span>}
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
            // Render sản phẩm không dùng slider khi có dưới 4 sản phẩm
            <div className="flex md:mx-0 mt-10">
              {products.map((product: Product, index) => (
                <div key={`${product._id}-${index}`} className="item mx-2" >
                  <div className="my-4">
                    <Link to='#' className="overflow-hidden rounded-lg shadow-lg">
                      <img src={`${product.image}`} alt="" className="h-[250px] w-[260px] object-cover rounded-[10px] shadow-3xl border-2" />
                    </Link>
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="">
                          <Link to={`detail/${product._id}`}>
                            <h3 className="">{product.name}</h3>
                          </Link>
                          <p>{formatPrice(product.price)} SVNĐ </p>
                        </div>
                        <div className="">
                          <i className='text-sm'>
                            {product.status === 'available' ? '' : <span className="text-red-500">Hết hàng</span>}
                          </i>
                        </div>
                      </div>
                      {
                        product.status === 'available' ? (
                          <div className="w-[260px] mt-5">
                            <button key={product._id} onClick={() => toggleModal(product)} className="relative inline-flex w-full items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-base font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#ea8025] to-orange-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
                              <span className="relative flex items-center justify-center gap-4 w-full px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                <h2>Mua ngay</h2>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                </svg>
                              </span>
                            </button>
                          </div>
                        ) : ''
                      }

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/*  */}
          <div className="banner-mid mt-16">
            <img src="/src/assets/images/banner/Banner_TX.jpg" alt="" />
          </div>
        </div >
        <Homes />
      </div >
      {/* Mua ngay */}
      <Drawer open={isOpen} onClose={handleClose}>
        {/* <Drawer.Header title="Cart" /> */}
        <Drawer.Items>
          {isModalOpen && selectedProduct && (
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
              <Modal.Header className="relative h-0 top-5 text-black p-0 mr-2 border-none">
              </Modal.Header>
              <Modal.Body className="bg-gray-100">
                <div className="flex gap-3">
                  <div className="w-[170px]">
                    <img src={selectedProduct.image} alt="Ảnh sản phẩm" className="w-[160px] h-[160px] rounded-xl" />
                  </div>
                  <div className="w-max flex-1">
                    <h1 className="text-lg font-medium">{selectedProduct.name}</h1>
                    <div className="flex items-end gap-1 py-1 *:text-[#ea8025] *:font-medium">
                      <p className="text-sm ">{formatPrice(selectedProduct.price)}</p>
                      <p className="text-[10px]">VNĐ</p>
                    </div>
                    <i className="text-sm text-black" dangerouslySetInnerHTML={{ __html: selectedProduct.description }}></i>
                    <div className="flex gap-10 items-center py-4">
                      <form className="max-w-xs py-1">
                        <div className="relative flex items-center">
                          <button
                            type="button"
                            onClick={handleDecrement}
                            className="flex-shrink-0 bg-[#ea8025] inline-flex items-center justify-center border border-[#ea8025] rounded-2xl h-5 w-5 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none"
                          >
                            <svg className="w-2.5 h-2.5 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h16" />
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
                            <svg className="w-2.5 h-2.5  text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16" />
                            </svg>
                          </button>
                        </div>
                      </form>
                      <button className="bg-[#ea8025] border-[#ea8025] text-white border-2 h-[30px] px-3 rounded-2xl transform transition-transform duration-500 hover:scale-105">
                        {inFormatPrice(selectedProduct.price, selectedSize?.size_id.priceSize || 0, quantity)} VNĐ
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
                          <input key={size.size_id._id}
                            type="radio"
                            name="size"
                            checked={selectedSize === size}
                            onChange={() => handleSizeChange(size)}
                            disabled={size.status === "unavailable"}
                            className="text-[#ea8025] border-[#ea8025] border-2"
                          />
                          <label htmlFor="">{size.size_id.name}</label>
                        </div>
                      )
                    }
                    )}
                  </form>
                </div>
                {/* Topping Selection */}
                <div className="">
                  <h2 className="font-medium px-6">Topping</h2>
                  <form className="bg-white shadow-xl my-1 rounded-md">
                    {selectedProduct.product_toppings.map((topping) => (
                      <div key={topping.topping_id._id} className="flex items-center gap-2 px-6 py-2">
                        <input
                          type="checkbox"
                          checked={selectedToppings.includes(topping)}
                          onChange={() => handleToppingChange(topping)}
                          disabled={topping.stock <= 0}
                          className="text-[#ea8025] border-[#ea8025] border-2"
                        />
                        <label htmlFor="">
                          {topping.topping_id.nameTopping} {topping.priceTopping && `(+${topping.priceTopping} đ)`}
                        </label>
                      </div>
                    ))}
                  </form>
                </div>
                <div className="flex mt-4">
                  <button
                    onClick={() => {
                      addToCart(selectedProduct?._id);
                    }}
                    className="relative bg-white  px-6 py-2 border border-[#ea8025] text-lg rounded-md transition duration-300 overflow-hidden focus:outline-none cursor-pointer group text-black font-semibold"
                  >
                    <span className="relative z-10 transition duration-300 group-hover:text-white"><p className="text-base">Thêm giỏ hàng</p></span>
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
