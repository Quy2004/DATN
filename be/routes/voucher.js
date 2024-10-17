import express from "express";
import VoucherController from "../controllers/voucher";

const voucherRouter = express.Router();
const voucherController = new VoucherController();

voucherRouter.get("/", voucherController.getAllVouchers);
voucherRouter.get("/:id", voucherController.getVouchersByID);
voucherRouter.post("/", voucherController.createVoucher);
voucherRouter.put("/:id", voucherController.updateVoucher);
voucherRouter.delete("/:id", voucherController.deleteVoucher);
voucherRouter.patch("/:id/soft-delete", voucherController.deleteSoftVoucher);
voucherRouter.patch("/:id/restore", voucherController.restoreVoucher);

export default voucherRouter;
