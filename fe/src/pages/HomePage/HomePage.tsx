import { Link } from "react-router-dom";
import Homes from "../../components/Homes";
import "./HomePage.css"
import React, { useState, useEffect } from 'react';
import instance from "../../services/api";
import { Product } from "../../types/product";
import Slider from "react-slick"
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
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
  return (
    <>
      <div >
        <img src={images[currentIndex]} alt="" className="w-max" />
        <div className='containerAll mx-auto home'>
          <h1 className='font-semibold text-3xl p-3'>Sản Phẩm Hot</h1>
          <div className='row grid grid-cols-4 gap-7 text-left h-[330px]'>
            <div className="cow_left col-span-2">
              <img src="/src/assets/images/banner/banner4.jpg" alt="" className="mb-10" />
            </div>
            <div className="cow_right col-span-2 flex gap-5 ">
              {
                products.map((product: Product) => (
                  <div className="item">
                    <div className="product_img">
                      <Link to='#'>
                        <img src={`${product.image}`} alt="" />
                      </Link>
                    </div>
                    <Link to="#">
                      <h3 className="">{product.name}</h3>
                    </Link>
                    <p>{formatPrice(product.price)} VNĐ </p>
                  </div>
                ))
              }
            </div>
          </div>
          <div className="grid grid-cols-1 ">
            <Slider {...settings}>
              {products.map((product: Product) => (
                <div key={product.name} className="item mx-2.5  *:mx-2.5">
                  <div>
                    <Link to='#' className="overflow-hidden rounded-lg shadow-lg">
                      <img src={`${product.image}`} alt="" className="h-[250px] w-[260px] object-cover rounded-[10px] shadow-3xl border-2" />
                    </Link>
                    <Link to="#">
                      <h3 className="">{product.name}</h3>
                    </Link>
                    <p className="md:mx-0">{formatPrice(product.price)} VNĐ </p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
          {/*  */}
          <div className="banner-mid">
            <img src="/src/assets/images/banner/Banner_TX.jpg" alt="" />
          </div>
        </div>
        <Homes />
      </div>
    </>
  );
};

export default HomePage;