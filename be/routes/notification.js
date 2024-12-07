import express from "express";
import NotificationController from "../controllers/notifications";

const NotificationRouter = express.Router();

const NotificationControllers = new NotificationController();
NotificationRouter.get("/:userId", NotificationControllers.getAllNotifications);
NotificationRouter.post("/", NotificationControllers.createNotifications);
NotificationRouter.delete("/:id", NotificationControllers.deleteNotification);
NotificationRouter.patch("/:id/read", NotificationControllers.markAsRead); // Sửa thành NotificationRouter.patch

NotificationRouter.get("/count-unread/:userId", NotificationControllers.countUnreadNotifications);
export default NotificationRouter;
