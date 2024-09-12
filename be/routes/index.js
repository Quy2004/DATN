import { Router } from "express";
import categoriesRouter from "./categories.js";
import productsRouter from "./products.js";

const router = Router();

router.get("/", (req, res) => {
  res.send("Home");
});

router.use("/categories", categoriesRouter);
router.use("/products", productsRouter);
export default router;
