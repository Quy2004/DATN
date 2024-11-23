import express from "express";
import CommentController from "../controllers/comment";

const commentRouter = express.Router();

const commentController = new CommentController();
commentRouter.get("/", commentController.getAllComments);
commentRouter.get("/parent/:parent_id", commentController.getCommentParent);
commentRouter.post("/", commentController.createComment);
// commentRouter.patch("/:id/loock", commentController.lookComment);
// commentRouter.patch("/:id/unloock", commentController.unLookComment);
commentRouter.patch("/:id/update", commentController.updateStatusComment);
commentRouter.patch("/:id/soft-delete", commentController.softDeleteComment);
commentRouter.patch("/:id/remote", commentController.remoteComment);
export default commentRouter;
