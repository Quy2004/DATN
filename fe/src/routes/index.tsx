
import { Route, Routes } from "react-router-dom";
import WebsiteLayout from "../pages/Layout/WebsiteLayout";
import HomePage from "../pages/HomePage/HomePage";
import TeaPage from "../pages/TeaPage/TeaPage";
import CoffeePage from "../pages/CoffeePage/Coffee";
import MenuPage from "../pages/MenuPage/MenuPage";
import ChuyenNhaPage from "../pages/ChuyenNhaPage/ChuyenNha";
import AllHomes from "../pages/ChuyenNhaPage/Tabs/AllHomes";
import CoffeHolicTab from "../pages/ChuyenNhaPage/Tabs/CoffeeHome";
import TeaHolicTab from "../pages/ChuyenNhaPage/Tabs/TeaHomes";
import BlogTab from "../pages/ChuyenNhaPage/Tabs/BlogHomes";
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
import VoucherAddPage from "../admin/Voucher/add/page";
import VoucherUpdatePage from "../admin/Voucher/edit/page";
import ToppingManagerPage from "../admin/Topping/Topping";
import ToppingAddPage from "../admin/Topping/add/page";
import ToppingUpdatePage from "../admin/Topping/edit/page";
import ProductManagerPage from "../admin/ProductAdmin/Product";
import NotFoundPage from "../pages/NotFound/NotFound";
import AuthPage from "../account/AuthPage/AuthPage";

import BannerManagerPage from "../admin/Banner/Banner";
import BannerAddPage from "../admin/Banner/add/page";
import BannerUpdatePage from "../admin/Banner/edit/page";
import CategoryPostManagerPage from "../admin/CategoryPost/page";
import DetailPage from "../pages/DetailPage/DetailPage";
import CategoryPostAddPage from "../admin/CategoryPost/add/page";
import CategoryPostupdatePage from "../admin/CategoryPost/edit/page";
import CheckOut from "../pages/CheckOutPage/CheckOut";
import VoucherPage from "../admin/Voucher/Voucher";
import PostManagerPage from "../admin/Post/page";
import CartPage from "../pages/CartPage/Cartpage";
import PostAddPage from "../admin/Post/add/page";
import PostUpdatePage from "../admin/Post/edit/page";
import ResetPassword from "../account/forgotPassword/resetPassword";
import Tracking from "../account/SettingAuth/Tracking";
import AccountUpdate from "../account/SettingAuth/AccountUpdate";
import OderHistory from "../account/SettingAuth/OderHistory";
import OrderSuccess from "../pages/OrderSuccess/OderSuccess";
import OrderErr from "../pages/OrderError/OrderError";

const Router = () => {
  return (
    <div>
      <Routes>
        <Route path="" element={<WebsiteLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="tea" element={<TeaPage />} />
          <Route path="coffee" element={<CoffeePage />} />
          <Route path="menu" element={<MenuPage />}>
            {/* <Route path="" element={<AllSideBar />} />*/}
          </Route>
          <Route path="detail/:id" element={<DetailPage />} />
          <Route path="checkout" element={<CheckOut />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="chuyennha" element={<ChuyenNhaPage />}>
            <Route path="" element={<AllHomes />} />
            <Route path="coffeeholic" element={<CoffeHolicTab />} />
            <Route path="teaholic" element={<TeaHolicTab />} />
            <Route path="blog" element={<BlogTab />} />
          </Route>
          <Route path="login" element={<AuthPage />} />
          <Route path="register" element={<AuthPage />} />
          <Route path="forgot" element={<Forgot />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="account-update" element={<AccountUpdate />} />
          <Route path="tracking" element={<Tracking />} />
          <Route path="oder-history" element={<OderHistory />} />
          <Route path="oder-success" element={<OrderSuccess />} />
          <Route path="order-error" element={<OrderErr />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route path="category" element={<CategoryManagerPage />} />
          <Route path="category/add" element={<CategoryAddPage />} />
          <Route path="category/:id/update" element={<CategoryUpdatePage />} />

          <Route path="size" element={<SizeManagerPage />} />
          <Route path="size/add" element={<SizeAddPage />} />
          <Route path="size/:id/update" element={<SizeUpdatePage />} />

          <Route path="voucher" element={<VoucherPage />} />
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
          <Route path="CategoryPost/add" element={<CategoryPostAddPage />} />
          <Route
            path="CategoryPost/:id/update"
            element={<CategoryPostupdatePage />}
          />

          <Route path="post" element={<PostManagerPage />} />
          <Route path="post/add" element={<PostAddPage />} />
          <Route path="post/:id/update" element={<PostUpdatePage />} />
        </Route>
      </Routes>
    </div>
  );
};

export default Router;
