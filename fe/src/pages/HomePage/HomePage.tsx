import { Link } from "react-router-dom";
import Homes from "../../components/Homes";
import "./HomePage.css"
import React, { useState, useEffect } from 'react';
import instance from "../../services/api";
import { Product } from "../../types/product";
import Slider from "react-slick"
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Button, Drawer, Modal } from "flowbite-react";
const HomePage: React.FC = () => {
  // slideShow
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const images: string[] = [
    "/src/assets/images/banner/Banner_1.webp",
    "/src/assets/images/banner/Banner_2.webp",
    "/src/assets/images/banner/Banner_3.webp"

  ]; // Thêm các hình ảnh bạn muốn sử dụng ở đây
  var settings = {
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
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
                  <div className="product_img">
                    <Link to={`detail/${product._id}`}>
                      <img src={`${product.image}`} alt="" className="" />
                    </Link>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="">
                      <Link to="#">
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
                  <div className="w-[255px] mt-5">
                  {
                      product.status === 'available' ? (
                        <div className="w-[260px] mt-5">
                          <button onClick={toggleModal} className="relative inline-flex w-full items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-base font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#ea8025] to-orange-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
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
              ))}
            </div>
          </div>
          {/* 4 sản phầm HOT */}
          {products.length > 3 ? (
            <Slider {...settings}>
              {products.map((product: Product, index) => (
                <div className="flex md:mx-0">
                  <div key={`${product._id}-${index}`} className="item mx-2" >
                    <div className="my-4">
                      <Link to='#' className="overflow-hidden rounded-lg shadow-lg">
                        <img src={`${product.image}`} alt="" className="h-[250px] w-[260px] object-cover rounded-[10px] shadow-3xl border-2" />
                      </Link>
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="">
                            <Link to="#">
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
                        <div className="w-[260px] mt-5">
                          {/* <button onClick={toggleModal}
                            className="relative inline-flex w-full items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-base font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#ea8025] to-orange-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
                            <span className="relative flex items-center justify-center gap-4 w-full px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                              <h2>Mua ngay</h2>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                              </svg>
                            </span>
                          </button> */}

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
                          <Link to="#">
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
                            <button onClick={toggleModal} className="relative inline-flex w-full items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-base font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-[#ea8025] to-orange-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
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
      <Drawer open={isOpen} onClose={handleClose} position="right">
        <Drawer.Header title="Cart" />
        <Drawer.Items>
          <Modal show={isModalOpen} onClose={toggleModal}>
            <Modal.Header>
              <h1 className="text-2xl">
                Mua ngay
              </h1>
            </Modal.Header>
            <Modal.Body>
              <div className="flex *:border-2">
                <div>
                  <img src="" alt="Ảnh.jpg" />
                </div>
                <div>
                  <h1>Cà phê không phê</h1>
                  <p>30.000 đ</p>
                  <i>Không ngon không lấy tiền</i>
                  <br />
                  <input type="number" min={1} />
                  <br />
                  <button>
                    +30.000 đ
                  </button>
                </div>
              </div>
              <div>
                <div>
                  <h2>Chọn size</h2>
                  <input type="radio" name="S" id="S" />S
                  <input type="radio" name="M" id="" />M
                  <input type="radio" name="L" id="" />L
                </div>
                <div>
                  <h2>Topping</h2>
                  <input type="radio" name="S" id="S" />A
                  <input type="radio" name="M" id="" />B
                  <input type="radio" name="L" id="" />C
                </div>
              </div>
              <div className="flex">
                <Button type="submit">
                  Thêm giỏ hàng
                </Button>
                {/* <Button type="submit">
                  Thanh toán
                </Button> */}
                <Link to={'register'} >Thanh toán</Link>
              </div>
            </Modal.Body>
          </Modal>

        </Drawer.Items>
      </Drawer>
    </>
  );
};

export default HomePage;
