import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import WebsiteLayout from "../pages/Layout/WebsiteLayout";
import HomePage from "../pages/HomePage/HomePage";
import TeaPage from "../pages/TeaPage/TeaPage";
import CoffeePage from "../pages/CoffeePage/Coffee";
import MenuPage from "../pages/MenuPage/MenuPage";
import AllSideBar from "../pages/MenuPage/SideBar/AllSide";
import TeaSideBar from "../pages/MenuPage/SideBar/TeaSideBar";
import ChuyenNhaPage from "../pages/ChuyenNhaPage/ChuyenNha";
import AllHomes from "../pages/ChuyenNhaPage/Tabs/AllHomes";
import CoffeHolicTab from "../pages/ChuyenNhaPage/Tabs/CoffeeHome";
import TeaHolicTab from "../pages/ChuyenNhaPage/Tabs/TeaHomes";
import BlogTab from "../pages/ChuyenNhaPage/Tabs/BlogHomes";
import Signin from "../account/signin/signin";
import Signup from "../account/signup/signup";
import Forgot from "../account/forgotPassword/forgot";
import AdminLayout from "../pages/Layout/AdminLayout";


import OrderAdmin from "../admin/OrderAdmin/OrderAdmin";
import CommentAdmin from "../admin/Comment/Comment";
import ClientAdmin from "../admin/Client/ClientAdmin";
import CategoryAddPage from "../admin/Category/add/page";
import CategoryUpdatePage from "../admin/Category/edit/page";

import CategoryManagerPage from "../admin/Category/Category";
import ProductAddPage from "../admin/ProductAdmin/add/page";
import ProductEditPage from "../admin/ProductAdmin/edit/page";

import SizeManagerPage from "../admin/Size/Size";
import SizeAddPage from "../admin/Size/add/page";
import SizeUpdatePage from "../admin/Size/edit/page";
import Voucher from "../admin/Voucher/Voucher";
import VoucherAddPage from "../admin/Voucher/add/page";
import VoucherUpdatePage from "../admin/Voucher/edit/page";
import ToppingManagerPage from "../admin/Topping/Topping";
import ToppingAddPage from "../admin/Topping/add/page";
import ToppingUpdatePage from "../admin/Topping/edit/page";
import ProductManagerPage from "../admin/ProductAdmin/Product";
import { Product } from "../types/product";
import instance from "../services/api";
import BannerManagerPage from "../admin/Banner/Banner";
import BannerAddPage from '../admin/Banner/add/page';
import BannerUpdatePage from "../admin/Banner/edit/page";
import CategoryPostManagerPage from "../admin/CategoryPost/page";



const Router = () => {
  const [products, setProduct] = useState<Product[]>([])
  const loadPr = async () => {
    (async () => {
      try {
        const response = await instance.get("/products");
        const { data } = response;
        // console.log(data);
        if (Array.isArray(data.data)) {
          setProduct(data.data);
        } else {
          console.error("Dữ liệu trả về không phải là mảng:", data);
          setProduct([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        setProduct([]);
      }
    })();
  }
  useEffect(() => {
    const fetch = async () => {
      loadPr()
    }
    fetch()
  }, []);
  return (
    <div>
      <Routes>
        <Route path="" element={<WebsiteLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="tea" element={<TeaPage />} />
          <Route path="coffee" element={<CoffeePage />} />
          <Route path="menu" element={<MenuPage />}>
            <Route path="" element={<AllSideBar />} />
            <Route path="teaside" element={<TeaSideBar />} />
          </Route>
          <Route path="chuyennha" element={<ChuyenNhaPage />}>
            <Route path="" element={<AllHomes />} />
            <Route path="coffeeholic" element={<CoffeHolicTab />} />
            <Route path="teaholic" element={<TeaHolicTab />} />
            <Route path="blog" element={<BlogTab />} />
          </Route>
          <Route path="signin" element={<Signin />} />
          <Route path="register" element={<Signup />} />
          <Route path="forgot" element={<Forgot />} />
        </Route>
        <Route path="admin" element={<AdminLayout />}>
          <Route path="category" element={<CategoryManagerPage />} />
          <Route path="category/add" element={<CategoryAddPage />} />
          <Route path="category/:id/update" element={<CategoryUpdatePage />} />

          <Route path="size" element={<SizeManagerPage />} />
          <Route path="size/add" element={<SizeAddPage />} />
          <Route path="size/:id/update" element={<SizeUpdatePage />} />

          <Route path="voucher" element={<Voucher />} />
          <Route path="voucher/add" element={<VoucherAddPage />} />
          <Route path="voucher/:id/update" element={<VoucherUpdatePage />} />

          <Route path="product" element={<ProductManagerPage />} />
          <Route path="product/add" element={<ProductAddPage />} />
          <Route path="product/:id/update" element={<ProductEditPage />} />

          <Route path="topping" element={<ToppingManagerPage />} />
          <Route path="topping/add" element={<ToppingAddPage />} />
          <Route path="topping/:id/update" element={<ToppingUpdatePage />} />
          <Route path="order" element={<OrderAdmin />} />
          <Route path="comment" element={<CommentAdmin />} />
          <Route path="client" element={<ClientAdmin />} />

          <Route path="banner" element={<BannerManagerPage />} />
          <Route path="banner/add" element={<BannerAddPage />} />
          <Route path="banner/:id/update" element={<BannerUpdatePage />} />
          
          <Route path="CategoryPost" element={<CategoryPostManagerPage />} />
        </Route>
      </Routes>
    </div>
  );
};

export default Router;
