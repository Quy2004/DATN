import express from "express";
import CategoryPostController from "../controllers/categoryPost";

const categoryPostRouter= express.Router();
const categoryPost= new CategoryPostController()

categoryPostRouter.get("/", categoryPost.getAllCategoryPosts);
categoryPostRouter.post("/", categoryPost.createCategoryPost)

export default categoryPostRouter
