import Order from "../models/OderModel.js"; // Đảm bảo đúng chính tả file
import moment from "moment";
import dotenv from "dotenv";
import mongoose from "mongoose";
import qs from "qs"; // Thêm qs để serialize data cho POST request

class VnPayController {
    async updateTransaction(req, res) {
		try {
			const orderId = req.query.vnp_TxnRef
			if (orderId) {
				// update trang thai don hang
				const order = await Order.findByIdAndUpdate(
					orderId,
					{ paymentStatus: "paid" },
					{ new: true }
				  );
			}
			res.redirect("http://localhost:5173?payment_order_status=true")
		} catch (error) {
			console.log('updateTransaction', error);
		}
	}
}

export default VnPayController;
