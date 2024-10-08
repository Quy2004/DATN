import express from "express";
import SizeController from "../controllers/size";

const sizeRouter = express.Router();
const Size = new SizeController()

sizeRouter.get("/", Size.getAllSize);
sizeRouter.get("/:id", Size.getSizeById);
sizeRouter.post("/", Size.createSize);

export default sizeRouter;
