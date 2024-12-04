import express from "express";
import NotificationController from "../controllers/notifications";

const NotificationRouter = express.Router();

const NotificationControllers = new NotificationController();
NotificationRouter.get("/:userId", NotificationControllers.getAllNotifications);
NotificationRouter.post("/", NotificationControllers.createNotifications);
NotificationRouter.delete("/:id", NotificationControllers.deleteNotification);
export default NotificationRouter;
