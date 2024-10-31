import express from "express";
import PostController from "../controllers/post";

const postRouter = express.Router();

const postController = new PostController();

postRouter.get("/", postController.getAllPosts);
postRouter.get("/:id", postController.getPostDetail);
postRouter.post("/", postController.createPost);
export default postRouter;
