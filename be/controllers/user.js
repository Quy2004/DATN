import User from "../models/UserModel";

class UserController {
	// Hiện thị toàn bộ danh sách người dùng
	async getAllUsers(req, res) {
		try {
			const { isDeleted, all, search, allUser, role, page = 1, limit = 10 } = req.query;
	
			// Tạo điều kiện lọc
			let query = {};
	
			if (all === "true") {
				// Nếu `all=true`, lấy tất cả người dùng
				query = {};
			} else if (isDeleted === "true") {
				// Nếu `isDeleted=true`, chỉ lấy các người dùng đã bị xóa mềm
				query.isDeleted = true;
			} else {
				// Mặc định lấy các người dùng chưa bị xóa mềm
				query.isDeleted = false;
			}
	
			// Thêm điều kiện tìm kiếm theo tên người dùng
			if (search) {
				query.userName = { $regex: search, $options: "i" }; // không phân biệt viết hoa hay viết thường
			}
	
			if (role === "allUser") {
				// Nếu `all=true`, lấy tất cả người dùng
				query = {};
			} else if (role === "admin") {
				// Nếu `isDeleted=true`, chỉ lấy các người dùng đã bị xóa mềm
				query.role = "admin";
			} else if (role === "manager") {
				// Nếu `isDeleted=true`, chỉ lấy các người dùng đã bị xóa mềm
				query.role = "manager";
			} else{
				query.role = "user";
			}
	
			// số lượng trên mỗi trang
			const pageLimit = parseInt(limit, 10) || 10;
			const currentPage = parseInt(page, 10) || 1;
			const skip = (currentPage - 1) * pageLimit;
	
			// thực hiện phân trang
			const users = await User.find(query)
				.sort({ createdAt: -1 }) // sắp xếp theo ngày tạo giảm dần
				.skip(skip)
				.limit(pageLimit)
				.exec();
	

				users.sort((a, b) => {
					const roleOrder = { admin: 1, manager: 2, user: 3 }; // Admin trước, Manager sau, User cuối
					return roleOrder[a.role] - roleOrder[b.role];
				});	
			// Tổng số người dùng để tính tổng số trang
			const totalItems = await User.countDocuments(query);
	
			res.status(200).json({
				message: "Get users done",
				data: users,
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
            const user= await User.findByIdAndUpdate(
                req.params.id,
                { isDeleted: true },
                { new: true }
            );

            if(!user) {
                return res.status(404).json({ message: "user not found" });
            }
            res.status(200).json({
                message: "Delete user Successfully",
                data: user,
            });
        } catch (error) {
            res.status(400).json({
                message: error.message,
              });
        }
	}
	// Khôi phục tài khoản
	async restoreUser(req, res) {
		try {
            const user= await User.findByIdAndUpdate(
                req.params.id,
                { isDeleted: false },
                { new: true }
            );

            if(!user) {
                return res.status(404).json({ message: "user not found" });
            }
            res.status(200).json({
                message: "Restore user Successfully",
                data: user,
            });
        } catch (error) {
            res.status(400).json({
                message: error.message,
              });
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
