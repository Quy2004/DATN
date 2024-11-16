import express from "express";
import AddressController from "../controllers/address";

const addressRouter = express.Router();
const address = new AddressController()

addressRouter.get("/user/:userId", address.getAll);
addressRouter.get("/:id", address.getAddressById);
addressRouter.post("/", address.createAddress);
addressRouter.put("/:user_id", address.updateAddress);
addressRouter.delete("/:id", address.deleteAddress);
addressRouter.put("/isdelete/:id", address.isDelete);
addressRouter.put("/restore/:id", address.restore);

export default addressRouter;
