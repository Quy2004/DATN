import Address from "../models/AddressModel";

class AddressController {
	// Hiển thị toàn bộ danh sách địa chỉ
	async getAll(req, res) {
        try {
            const { userId } = req.params; // Lấy userId từ params
            const addresses = await Address.find({ user_id: userId }).sort({ status: 1 }); // Sắp xếp theo status (primary trước)
    
            res.status(200).json({
                message: "Lấy danh sách địa chỉ thành công",
                data: addresses,
            });
        } catch (error) {
            res.status(400).json({
                message: error.message,
            });
        }
    }
    
    

    // hiển thị chi tiết 1 địa chỉ
    async getAddressById(req, res) {
        try {
            const address = await Address.findById(req.params.id)
            if (!address) {
                return res.status(404).json({
                    message: "Address Not Found",
                });
            }
            res.status(200).json({
                message: "Get Address Details Done",
                data: address,
            });
        } catch (error) {
            res.status(400).json({message: error.message})
        }
    }

	// thêm địa chỉ mới
	async createAddress(req, res) {
		try {
			const address = await Address.create(req.body);
			res.status(200).json({
				message: "Create Address Done",
				data: address,
			});
		} catch (error) {
			res.status(400).json({
				message: error.message,
			});
		}
	}

    // sửa địa chỉ 
    async updateAddress(req, res) {
        try {
            const { user_id } = req.params; // Lấy user_id từ params
            const { name, phone, address, status } = req.body; // Lấy dữ liệu cần cập nhật từ body
    
            // Nếu `status` là "primary", đổi tất cả địa chỉ khác thành "secondary"
            if (status === "primary") {
                await Address.updateMany(
                    { user_id, status: "primary" }, // Tìm các địa chỉ hiện tại là "primary" của user_id
                    { status: "secondary" } // Đặt thành "secondary"
                );
            }
    
            // Tìm và cập nhật địa chỉ theo user_id
            const updatedAddress = await Address.findOneAndUpdate(
                { user_id }, // Điều kiện tìm kiếm theo user_id
                { name, phone, address, status }, // Dữ liệu cần cập nhật
                { new: true, runValidators: true } // Trả về bản ghi đã cập nhật và kiểm tra ràng buộc
            );
    
            // Nếu không tìm thấy địa chỉ
            if (!updatedAddress) {
                return res.status(404).json({
                    message: "Address Not Found",
                });
            }
    
            // Trả về kết quả thành công
            res.status(200).json({
                message: "Update Address Done",
                data: updatedAddress,
            });
        } catch (error) {
            // Xử lý lỗi
            res.status(400).json({
                message: error.message,
            });
        }
    }
    

    // xóa địa chỉ
    async deleteAddress(req, res) {
        try {
            const address = await Address.findByIdAndDelete(req.params.id);
            if (!address) {
                return res.status(404).json({
                    message: "Address Not Found",
                });
            }
            res.status(200).json({
                message: "Delete Address Done",
            });
        } catch (error) {
            res.status(400).json({
                message: error.message,
            });
        }
    }

    // xóa mềm 1 địa chỉ người dùng
    async isDelete(req, res) {
        try {
            const { id } = req.params;

            // Tìm và cập nhật trường isDelete từ false thành true
            const updatedAddress = await Address.findByIdAndUpdate(
                id, 
                { isDelete: true }, 
                { new: true }
            );

            if (!updatedAddress) {
                return res.status(404).json({
                    message: 'Address not found',
                });
            }

            res.status(200).json({
                message: 'Address marked as deleted successfully',
                data: updatedAddress,
            });
        } catch (error) {
            res.status(400).json({
                message: error.message,
            });
        }
    }
    

    // Khoi phục địa chỉ bị xóa mềm
    async restore(req, res) {
        try {
            const { id } = req.params;

            // Tìm và cập nhật trường isDelete từ true thành false
            const restoredAddress = await Address.findByIdAndUpdate(
                id, 
                { isDelete: false }, 
                { new: true } // Trả về bản ghi sau khi cập nhật
            );

            if (!restoredAddress) {
                return res.status(404).json({
                    message: 'Address not found',
                });
            }

            res.status(200).json({
                message: 'Address restored successfully',
                data: restoredAddress,
            });
        } catch (error) {
            res.status(400).json({
                message: error.message,
            });
        }
    }

    
}

export default AddressController;
