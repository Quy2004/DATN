import express from "express";
import VnPayController from "../controllers/vnPay.js";

const vnPayRouter= express.Router()
const vnPayController= new VnPayController()

vnPayRouter.get('/webhook/update-transaction', vnPayController.updateTransaction)

export default vnPayRouter