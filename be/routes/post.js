import express from "express";
import PostController from "../controllers/post";

const postRouter = express.Router();

const postController = new PostController();

postRouter.get("/", postController.getAllPosts);
postRouter.get("/:id", postController.getPostDetail);
postRouter.post("/", postController.createPost);
postRouter.put("/:id", postController.updatePost);
postRouter.patch("/:id/soft-delete", postController.softDeletePost);
postRouter.delete("/:id/hard-delete", postController.hardDeletePost);
postRouter.patch("/:id/restore", postController.restorePost);
postRouter.get(
  "/:id/related",
  postController.getRelatedPosts.bind(postController)
);
export default postRouter;
