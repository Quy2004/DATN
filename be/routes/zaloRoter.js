import express from "express";
import zaloController from "../controllers/zaloController";


const zaloRouter = express.Router();
const zaloControllers = new zaloController();
zaloRouter.post("/zalo/create-payment", zaloControllers.createZaloPayCode)
zaloRouter.post("/zalo/callback", zaloControllers.callback)
zaloRouter.post("/zalo/check-order", zaloControllers.checkOrder)
export default zaloRouter;
