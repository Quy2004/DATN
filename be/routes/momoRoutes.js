import express from "express";
import MomoController from "../controllers/momoController";


const momoRouter = express.Router();
const momoController = new MomoController();

// Route tạo thanh toán MoMo
momoRouter.post("/momo/create-payment", momoController.createMomoPayment);
momoRouter.post("/momo/notify", momoController.handleMomoIPN);
export default momoRouter;
