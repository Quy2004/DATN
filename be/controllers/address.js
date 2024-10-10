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
}

export default AddressController;
