import User from "../models/UserModel";

class UserController {
	// Hiện thị toàn bộ danh sách người dùng
		async getAllUsers(req, res) {
			try {
				const user = await User.find({});
				res.status(200).json({
					message: "Get Users Done",
					data: user,
				});
			} catch (error) {
				res.status(400).json({ message: error.message });
			}
	}
	// Hiển thị chi tiết người dùng
	async getUserById(req, res) {
		try {
			const { id } = req.params; // Lấy id từ params
			const user = await User.findById(id); // Tìm người dùng theo ID
			if (!user) {
				return res.status(404).json({ message: "Người dùng không tìm thấy" });
			}
			res.status(200).json(user); // Trả về thông tin người dùng
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	}

	// Xóa người dùng(vĩnh viễn)
	// (tạm khóa vì như thầy yêu cầu admin k có quyền xóa người dùng mà chỉ có quyền khóa)
	// async deleteUserPermanently(req, res) {
	// 	try {
	// 		const id = req.params.id;
	// 		const response = await User.findOneAndDelete({ _id: id });
	// 		res.status(200).json({ message: "Xóa người dùng thành công" });
	// 	} catch (error) {
	// 		res.status(404).json({ message: error.message });
	// 	}
	// }

	// Xóa người dùng(xóa mềm)
	async deleteUser(req, res) {
		try {
			const { id } = req.params;
			const user = await User.findById(id);
			if (!user || user.status == "inactive") {
				res
					.status(400)
					.json({ message: "Người dùng không tồn tại hoặc đã bị xóa" });
			}
			user.status = "inactive";
			await user.save();
			res.status(200).json({ message: "Khóa người dùng  dùng thành công" });
		} catch (error) {
			res.status(404).json({ message: error.message });
		}
	}
	// Khôi phục tài khoản
	async restoreUser(req, res) {
		try {
			const { id } = req.params;
			const user = await User.findById(id);
			if (!user || user.status == "active") {
				res.status(400).json({ message: "Người dùng đang hoạt động" });
			}
			user.status = "active";
			await user.save();
			res.status(200).json({ message: "Khôi phục người dùng thành công" });
		} catch (error) {
			res.status(404).json({ message: error.message });
		}
	}

	// cấp quyền quản lí cho nhân viên 
	async managerUser(req, res) {
		try {
			const { id } = req.params;
			const user = await User.findById(id);
			if (!user || user.role == "manager") {
				res
					.status(400)
					.json({ message: "Người dùng đã là quản lí" });
			}
			user.role = "manager";
			await user.save();
			res.status(200).json({ message: "Người dùng đã được thêm thành quản lí" });
		} catch (error) {
			res.status(404).json({ message: error.message });
		}
	}

	// xóa quyền quản lí của nhân viên 
	async customerUser(req, res) {
		try {
			const { id } = req.params;
			const user = await User.findById(id);
			if (!user || user.role == "user") {
				res
					.status(400)
					.json({ message: "Người dùng đã không phải là quản lí" });
			}
			user.role = "user";
			await user.save();
			res.status(200).json({ message: "Người dùng đã bị xóa quyền quản lí thành quản lí" });
		} catch (error) {
			res.status(404).json({ message: error.message });
		}
	}

}

	


export default UserController;
