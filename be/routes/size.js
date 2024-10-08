import express from "express";
import SizeController from "../controllers/size";

const sizeRouter = express.Router();
const Size = new SizeController()

sizeRouter.get("/", Size.getAllSize);
sizeRouter.get("/:id", Size.getSizeById);
sizeRouter.post("/", Size.createSize);
sizeRouter.put("/:id", Size.updateSize);
sizeRouter.delete("/:id", Size.deleteSize);

export default sizeRouter;
