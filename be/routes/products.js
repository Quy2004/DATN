import express from "express";
import ProductController from "../controllers/products.js";

const productsRouter = express.Router();
const productsController = new ProductController();

productsRouter.get("/", productsController.getAllProducts);

export default productsRouter;
