import express from "express";
import CategoryPostController from "../controllers/categoryPost";

const categoryPostRouter= express.Router();
const categoryPost= new CategoryPostController()

categoryPostRouter.get("/", categoryPost.getAllCategoryPosts);
categoryPostRouter.get("/:id", categoryPost.getCategoryById);
categoryPostRouter.post("/", categoryPost.createCategoryPost)
categoryPostRouter.put("/:id", categoryPost.updateCategoryPost)

export default categoryPostRouter
