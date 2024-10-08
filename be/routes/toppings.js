import express from "express";
import ToppingController from "../controllers/toppings";

const toppingsRouter = express.Router();
const toppingsController = new ToppingController();

toppingsRouter.get("/", toppingsController.getAllToppings);
toppingsRouter.get("/:id", toppingsController.getToppingDetail);
toppingsRouter.post("/", toppingsController.createTopping);
toppingsRouter.put("/:id", toppingsController.updateTopping);
toppingsRouter.delete("/:id", toppingsController.deleteTopping);

export default toppingsRouter;
