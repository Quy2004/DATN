import { Link } from "react-router-dom";
import Homes from "../../components/Homes";
import "./HomePage.css"
import React, { useState, useEffect } from 'react';



const HomePage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const images: string[] = [
    "/src/assets/images/banner/Banner_1.webp",
    "/src/assets/images/banner/Banner_2.webp",
    "/src/assets/images/banner/Banner_3.webp"

  ]; // Thêm các hình ảnh bạn muốn sử dụng ở đây

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000); // Thay đổi 3000 thành khoảng thời gian bạn muốn giữa các hình ảnh

    return () => clearInterval(interval);
  }, [currentIndex, images.length]);

  return (
    <>
      <div >
        <img src={images[currentIndex]} alt="" className="w-max" />
        <div className='containerAll mx-auto home'>
          <h1 className='font-semibold text-3xl p-3'>Sản Phẩm Hot</h1>
          <div className='row grid grid-cols-2 gap-7 text-left'>
            <div className="cow_left">
              <img src="/src/assets/images/banner/banner4.jpg" alt="" className="mb-10" />
            </div>
            <div className="cow_right flex gap-5 ">
              <div className="item ">
                <div className="product_img">
                  <Link to='#'>
                    <img src="/src/assets/images/CF_sua_da.webp" alt="" />
                  </Link>
                </div>
                <Link to="#">
                  <h3 className="">Cà Phê Sữa Đá</h3>
                </Link>
                <p>200$ </p>
              </div>
              <div className="item ">
                <div className="product_img">
                  <img src="/src/assets/images/CF_sua_da.webp" alt="" />
                </div>
                <Link to="#">
                  <h3>Cà Phê Sữa Đá</h3>
                </Link>
                <p>200$ </p>
              </div>
            </div>
          </div>
          <div className="row grid grid-cols-2 gap-7 text-left">
            <div className=" flex gap-5">
              <div className="item ">
                <div className="product_img">
                  <img src="/src/assets/images/CF_sua_da.webp" alt="" />
                </div>
                <Link to="#">
                  <h3>Cà Phê Sữa Đá</h3>
                </Link>
                <p>200$ </p>
              </div>
              <div className="item ">
                <div className="product_img">
                  <img src="/src/assets/images/CF_sua_da.webp" alt="" />
                </div>
                <Link to="#">
                  <h3>Cà Phê Sữa Đá</h3>
                </Link>
                <p>200$ </p>
              </div>
            </div>
            <div className=" flex gap-5">
              <div className="item ">
                <div className="product_img">
                  <img src="/src/assets/images/CF_sua_da.webp" alt="" />
                </div>
                <Link to="#">
                  <h3>Cà Phê Sữa Đá</h3>
                </Link>
                <p>200$ </p>
              </div>
              <div className="item ">
                <div className="product_img">
                  <img src="/src/assets/images/CF_sua_da.webp" alt="" />
                </div>
                <Link to="#">
                  <h3>Cà Phê Sữa Đá</h3>
                </Link>
                <p>200$ </p>
              </div>
            </div>
          </div>
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