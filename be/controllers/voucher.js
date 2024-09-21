import Voucher from "../models/VoucherModel.js";
import { generateRandomCode } from "./generateRandomCode.js";

class VoucherController {
    // get all vouchers
	async getAllVouchers(req, res) {
		try {
			const voucher = await Voucher.find({});
			res.status(200).json({
				message: "Get Vouchers Done",
				data: voucher,
			});
		} catch (error) {
			res.status(404).json({ message: error.message });
		}
	}

    // get id the voucher
	async getVouchersByID(req, res) {
		try {
			const voucher = await Voucher.findById(req.params.id);
			if (!voucher) {
				return res.status(404).json({
					message: "voucher Not Found",
				});
			}
			res.status(200).json({
				message: "Get voucher Details Done",
				data: voucher,
			});
		} catch (error) {
			res.status(400).json({
				message: error.message,
			});
		}
	}

    // create the voucher
	async createVoucher(req, res) {
		try {
			req.body.code = req.body.code || generateRandomCode();
			const voucher = await Voucher.create(req.body);
			res.status(201).json({
				message: "Create Voucher Successfully!",
				data: voucher,
			});
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	}

	// Update a voucher
	async updateVoucher(req, res) {
		try {
			const { id } = req.params; 
			const updatedData = req.body; 
            
			const voucher = await Voucher.findByIdAndUpdate(id, updatedData, {
				new: true, 
				runValidators: true, 
			});

			if (!voucher) {
				return res.status(404).json({ message: "Voucher not found!" });
			}

			res.status(200).json({
				message: "Update Voucher Successfully!",
				data: voucher,
			});
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	}

// delete the voucher
async deleteVoucher(req, res){
    try {
        const {id}= req.params
        const voucher= await Voucher.findById(id)
        if(!voucher || voucher.status == 'inactive'){
            res.status(400).json({message: "Voucher không tồn tại hoặc đã bị xóa"})
        }
        voucher.status = 'inactive'
        await voucher.save()
        res.status(200).json({message: "Xóa voucher thành công"})
    } catch (error) {
        res.status(404).json({message: error.message});
    }
}
}



export default VoucherController;
