import express from "express";
import CategoryController from "../controllers/categories.js";

const categoriesRouter = express.Router();

const categoriesController = new CategoryController();
categoriesRouter.get("/", categoriesController.getAllCategory);
categoriesRouter.get("/:id", categoriesController.getCategoryDetails);
categoriesRouter.post("/", categoriesController.createCategory);
categoriesRouter.put("/:id", categoriesController.updateCategory);
categoriesRouter.delete("/:id", categoriesController.deleteCategory);
export default categoriesRouter;
