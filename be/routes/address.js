import express from "express";
import AddressController from "../controllers/address";

const addressRouter = express.Router();
const address = new AddressController()

addressRouter.get("/", address.getAll);
addressRouter.post("/", address.createAddress);
export default addressRouter;
