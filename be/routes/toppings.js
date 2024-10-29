import express from "express";
import ToppingController from "../controllers/toppings";

const toppingsRouter = express.Router();
const toppingsController = new ToppingController();

toppingsRouter.get("/", toppingsController.getAllToppings);
toppingsRouter.get("/:id", toppingsController.getToppingDetail);
toppingsRouter.post("/", toppingsController.createTopping);
toppingsRouter.put("/:id", toppingsController.updateTopping);
toppingsRouter.patch("/:id/soft-delete", toppingsController.softDeleteTopping);
toppingsRouter.delete("/:id/hard-delete", toppingsController.hardDeleteTopping);
toppingsRouter.patch("/:id/restore", toppingsController.restoreTopping);
toppingsRouter.patch(
  "/:id/update-status",
  toppingsController.updateStatusTopping
);

export default toppingsRouter;
