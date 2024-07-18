import express from "express";
import ProductController from "../controllers/products.js";

const productsRouter = express.Router();
const productsController = new ProductController();

productsRouter.get("/", productsController.getAllProducts);
productsRouter.get("/:id", productsController.getProductDetail);
productsRouter.post("/", productsController.createProduct);
productsRouter.put("/:id", productsController.updateProduct);
productsRouter.delete("/:id", productsController.deleteProduct);

export default productsRouter;
