import React from "react";
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

import ProductManagerPage from "../admin/ProductAdmin/Product";
import OrderAdmin from "../admin/OrderAdmin/OrderAdmin";
import CommentAdmin from "../admin/Comment/Comment";
import ClientAdmin from "../admin/Client/ClientAdmin";
import CategoryAddPage from "../admin/Category/add/page";
import CategoryUpdatePage from "../admin/Category/edit/page";
import CategoryManagerPage from "../admin/Category/Category";
import ProductAddPage from "../admin/ProductAdmin/add/page";
import ProductEditPage from "../admin/ProductAdmin/edit/page";

const Router = () => {
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

          <Route path="product" element={<ProductManagerPage />} />
          <Route path="product/add" element={<ProductAddPage />} />
          <Route path="product/:id/update" element={<ProductEditPage />} />

          <Route path="order" element={<OrderAdmin />} />
          <Route path="comment" element={<CommentAdmin />} />
          <Route path="client" element={<ClientAdmin />} />
        </Route>
      </Routes>
    </div>
  );
};

export default Router;
