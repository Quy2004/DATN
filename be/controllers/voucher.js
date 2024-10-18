import Voucher from "../models/VoucherModel.js";
import { generateRandomCode } from "./generateRandomCode.js";

class VoucherController {
	// get all vouchers
	async getAllVouchers(req, res) {
		try {
			const { isDeleted, all, search, page = 1, limit = 10 } = req.query;

			// Tạo điều kiện lọc
			let query = {};

			if (all === "true") {
				// Nếu `all=true`, lấy tất cả danh mục
				query = {};
			} else if (isDeleted === "true") {
				// Nếu `isDeleted=true`, chỉ lấy các danh mục đã bị xóa mềm
				query.isDeleted = true;
			} else {
				// Mặc định lấy các danh mục chưa bị xóa mềm
				query.isDeleted = false;
			}

			// search - điều kiện search theo name
			if (search) {
				query.name = { $regex: search, $options: "i" };
				// không phân biệt viết hoa hay viết thường
			}

			// số lượng trên mỗi trang
			const pageLimit = parseInt(limit, 10) || 10;
			const currentPage = parseInt(page, 10) || 1;
			const skip = (currentPage - 1) * pageLimit;

			// thực hiện phân trang
			const voucher = await Voucher.find(query)
				.sort({ createdAt: -1 }) // sắp xếp theo ngày tạo giảm dần
				.skip(skip)
				.limit(pageLimit)
				.exec();

			// Tổng số danh mục để tính tổng số trang
			const totalItems = await Voucher.countDocuments(query);

			res.status(200).json({
				message: "Get voucher Done",
				data: voucher,
				pagination: {
					totalItems,
					currentPage,
					totalPages: Math.ceil(totalItems / pageLimit),
				},
			});
		} catch (error) {
			res.status(400).json({ message: error.message });
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

	// Xóa mềm 1 voucher
	async deleteSoftVoucher(req, res) {
		try {
            const voucher= await Voucher.findByIdAndUpdate(
                req.params.id,
                { isDeleted: true },
                { new: true }
            );

            if(!voucher) {
                return res.status(404).json({ message: "voucher not found" });
            }
            res.status(200).json({
                message: "Delete voucher Successfully",
                data: voucher,
            });
        } catch (error) {
            res.status(400).json({
                message: error.message,
              });
        }
	}

	// Khôi phục voucher bị xóa mềm
	async restoreVoucher(req, res) {
		try {
            const voucher= await Voucher.findByIdAndUpdate(
                req.params.id,
                { isDeleted: false },
                { new: true }
            );

            if(!voucher) {
                return res.status(404).json({ message: "voucher not found" });
            }
            res.status(200).json({
                message: "Restore voucher Successfully",
                data: voucher,
            });
        } catch (error) {
            res.status(400).json({
                message: error.message,
              });
        }
	}

	// delete the voucher
	async deleteVoucher(req, res) {
		try {
			const id = req.params.id;
			const response = await Voucher.findOneAndDelete({ _id: id });
			res.status(200).json({ message: "Xóa voucher thành công" });
		} catch (error) {
			res.status(404).json({ message: error.message });
		}
	}
}

export default VoucherController;
