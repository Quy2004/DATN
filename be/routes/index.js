import { Router } from "express";
import categoriesRouter from "./categories.js";
import productsRouter from "./products.js";
import userRouter from "./user.js";
import voucherRouter from "./voucher.js";
import sizeRouter from './size';
import toppingsRouter from "./toppings.js";
import authRouter from './auth';

const router = Router();

router.get("/", (req, res) => {
  res.send("Home");
});

router.use("/categories", categoriesRouter);
router.use("/products", productsRouter);
router.use("/toppings", toppingsRouter);
router.use("/user", userRouter);
router.use("/voucher", voucherRouter);
router.use("/auth", authRouter); 
router.use("/size", sizeRouter); 
export default router;
