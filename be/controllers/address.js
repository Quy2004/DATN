import Address from "../models/AddressModel";

class AddressController {
	// Hiển thị toàn bộ danh sách địa chỉ
	async getAll(req, res) {
		try {
			const address = await Address.find({});
			res.status(200).json({
				message: "Get address Done",
				data: address,
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
            const address = await Address.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );
            if (!address) {
                return res.status(404).json({
                    message: "Address Not Found",
                });
            }
            res.status(200).json({
                message: "Update Address Done",
                data: address,
            });
        } catch (error) {
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
