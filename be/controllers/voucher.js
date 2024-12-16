import Voucher from "../models/VoucherModel.js";
import { generateRandomCode } from "./generateRandomCode.js";

class VoucherController {
	// get all vouchers
	async getAllVouchers(req, res) {
		try {
			const { isDeleted= "false", search, page = 1, limit = 10 } = req.query;

			// Tạo điều kiện lọc
			const query = {
				isDeleted: isDeleted === "true",
			  };

			// search - điều kiện search theo name
			if (search) {
				query.name = { $regex: search, $options: "i" };
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
	
			// Kiểm tra giá trị nhận được
			console.log("Updated Data:", updatedData);
	
			const currentDate = new Date(); // Thời gian hiện tại
			const maxOrderDate = new Date(updatedData.maxOrderDate); // Ngày kết thúc
	
			// Kiểm tra nếu số lượng = 0 hoặc ngày kết thúc đã đến
			if (updatedData.quantity === 0 || maxOrderDate <= currentDate) {
				updatedData.isDeleted = true; // Đánh dấu là đã xóa nếu số lượng = 0 hoặc maxOrderDate đã đến
			}
	
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
			const voucher = await Voucher.findById(req.params.id);
	
			// Kiểm tra nếu voucher không tồn tại
			if (!voucher) {
				return res.status(404).json({ message: "Voucher not found" });
			}
	
			// Kiểm tra điều kiện để khôi phục
			const currentDate = new Date();
	
			if (voucher.quantity === 0 || voucher.maxOrderDate < currentDate) {
				return res.status(400).json({
					message: "Số lượng phải lớn hơn 0, thời gian kết thúc không được trước thời điểm hiện tại",
				});
			}
	
			// Nếu điều kiện thỏa mãn, khôi phục voucher
			const restoredVoucher = await Voucher.findByIdAndUpdate(
				req.params.id,
				{ isDeleted: false },
				{ new: true }
			);
	
			res.status(200).json({
				message: "Restore voucher Successfully",
				data: restoredVoucher,
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
	async useVoucher(req, res) {
		try {
		  // Lấy ID voucher từ tham số URL
		  const { id } = req.params;
	  
		  // Tìm voucher trong cơ sở dữ liệu theo ID
		  const voucher = await Voucher.findById(id);
	  
		  // Kiểm tra nếu voucher không tồn tại
		  if (!voucher) {
			return res.status(404).json({ message: "Voucher không tìm thấy!" });
		  }
	  
		  // Kiểm tra thời gian hiệu lực của voucher (minOrderDate)
		  const currentDate = new Date();
		  const voucherStartDate = new Date(voucher.minOrderDate);
	  
		  // Nếu minOrderDate nhỏ hơn thời điểm hiện tại, cập nhật minOrderDate về giờ hiện tại
		  if (voucherStartDate < currentDate) {
			voucher.minOrderDate = currentDate; // Cập nhật minOrderDate về thời gian hiện tại
		  }
	  
		  // Kiểm tra số lượng voucher
		  if (voucher.quantity <= 0) {
			return res.status(400).json({ message: "Voucher đã hết số lượng sử dụng." });
		  }
	  
		  // Giảm số lượng voucher sau khi áp dụng
		  voucher.quantity -= 1;
	  
		  // Lưu lại voucher sau khi cập nhật minOrderDate và quantity
		  await voucher.save();
	  
		  // Trả về thông báo thành công và dữ liệu voucher đã được cập nhật
		  res.status(200).json({
			message: "Voucher đã được áp dụng thành công!",
			data: voucher, // Trả về dữ liệu voucher đã được cập nhật
		  });
		} catch (error) {
		  console.error("Lỗi khi áp dụng voucher:", error); // Ghi lỗi trong console để dễ dàng debug
		  res.status(500).json({ message: "Có lỗi xảy ra. Vui lòng thử lại.", error: error.message });
		}
	  }
	  
}

export default VoucherController;
