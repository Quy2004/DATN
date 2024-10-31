import { Router } from "express";
import categoriesRouter from "./categories.js";
import productsRouter from "./products.js";
import userRouter from "./user.js";
import voucherRouter from "./voucher.js";
import sizeRouter from './size';
import toppingsRouter from "./toppings.js";
import authRouter from './auth';
import addressRouter from "./address.js";
import RouterCart from "./Cart.js";
import ordersRouter from"./ordersRouter.js"
import ordersDetailRouter from"./ordersDetail.js"
import bannerRouter from "./banners.js";
import categoryPostRouter from "./categoryPost.js";
import postRouter from "./post.js";

const router = Router();

router.get("/", (req, res) => {
  res.send("Home");
});

router.use("/categories", categoriesRouter);
router.use("/products", productsRouter);
router.use("/toppings", toppingsRouter);
router.use("/users", userRouter);
router.use("/vouchers", voucherRouter);
router.use("/auth", authRouter); 
router.use("/sizes", sizeRouter); 
router.use("/address", addressRouter); 
router.use("/cart", RouterCart); 
router.use("/orders", ordersRouter);
router.use("/orders-detail", ordersDetailRouter);
router.use("/banners", bannerRouter);
router.use("/categoryPost", categoryPostRouter);
router.use("/posts", postRouter);

export default router;