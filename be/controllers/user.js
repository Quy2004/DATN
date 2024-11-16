import User from "../models/UserModel";
import Address from "../models/AddressModel";

class UserController {
	// Hiện thị toàn bộ danh sách người dùng
	async getAllUsers(req, res) {
		try {
			const { isDeleted = "false", search, role, page = 1, limit = 10 } = req.query;
	
			// Tạo điều kiện lọc
			let query = {
				isDeleted: isDeleted === "true",
			};
	
			// Thêm điều kiện tìm kiếm theo tên người dùng
			if (search && search.trim()) { // Kiểm tra nếu search không rỗng
				query.userName = { $regex: search.trim(), $options: "i" }; // Tìm kiếm không phân biệt chữ hoa chữ thường
			}
	
			// Điều kiện cho role
			if (role && role !== "allUser") {
				query.role = role; // Nếu có role, chỉ lấy người dùng theo role
			}
	
			// Số lượng trên mỗi trang
			const pageLimit = parseInt(limit, 10) || 10;
			const currentPage = parseInt(page, 10) || 1;
			const skip = (currentPage - 1) * pageLimit;
	
			// Thực hiện phân trang
			const users = await User.find(query)
				.sort({ createdAt: -1 }) // Sắp xếp theo ngày tạo giảm dần
				.skip(skip)
				.limit(pageLimit)
				.exec();
	
			// Sắp xếp người dùng theo vai trò
			users.sort((a, b) => {
				const roleOrder = { admin: 1, manager: 2, user: 3 }; // Admin trước, Manager sau, User cuối
				return (roleOrder[a.role] || Infinity) - (roleOrder[b.role] || Infinity); // Đảm bảo rằng các vai trò không xác định được xếp ở cuối
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

	// cập nhật thông tin người dùng
	async updateUser(req, res) {
		try {
			const { id } = req.params;  // ID người dùng từ params
			const { userName, email, avatars } = req.body;
	
			// Cập nhật thông tin người dùng
			const user = await User.findByIdAndUpdate(
				id,
				{ userName, email, avatars },
				{ new: true }  // Trả về bản ghi mới sau khi cập nhật
			);
	
			
	
			res.status(200).json({
				message: "User updated successfully",
				data: {
					user
				}
			});
		} catch (error) {
			console.error(error);
			res.status(400).json({
				message: "Error occurred while updating user",
				error: error.message,
			});
		}
	}
	

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
	// async managerUser(req, res) {
	// 	try {
	// 		const { id } = req.params;
	// 		const user = await User.findById(id);
	// 		if (!user || user.role == "manager") {
	// 			res
	// 				.status(400)
	// 				.json({ message: "Người dùng đã là quản lí" });
	// 		}
	// 		user.role = "manager";
	// 		await user.save();
	// 		res.status(200).json({ message: "Người dùng đã được thêm thành quản lí" });
	// 	} catch (error) {
	// 		res.status(404).json({ message: error.message });
	// 	}
	// }


	async adminUser(req, res) {
		try {
			const { id } = req.params;
			const user = await User.findById(id);
			if (!user || user.role == "admin") {
				res
					.status(400)
					.json({ message: "Người dùng đã là quản lí" });
			}
			user.role = "admin";
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
			
			// Kiểm tra người dùng cần thay đổi quyền
			const user = await User.findById(id);
			if (!user || user.role !== "admin") {
				return res.status(400).json({ message: "Người dùng không phải là quản lý" });
			}
	
			// Kiểm tra số lượng người dùng có vai trò 'admin'
			const adminCount = await User.countDocuments({ role: "admin" });
			if (adminCount <= 1) {
				return res.status(400).json({ message: "Không thể xóa quyền quản lý vì chỉ còn 1 quản lý" });
			}
	
			// Cập nhật quyền của người dùng thành 'user'
			user.role = "user";
			await user.save();
			
			res.status(200).json({ message: "Người dùng đã bị xóa quyền quản lý thành quản lý" });
		} catch (error) {
			res.status(404).json({ message: error.message });
		}
	}
	
	

}

	


export default UserController;
