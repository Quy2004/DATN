import NotificationModel from "../models/NotificationModel";

class NotificationController {
	async getAllNotifications(req, res) {
		try {
			const { userId } = req.params; // Lấy userId từ params

			// Nếu không có userId hoặc userId là null
			const filter =
				userId === "null"
					? { user_Id: null } // Nếu userId là "null", chỉ lấy các thông báo có user_Id = null
					: { $or: [{ user_Id: userId }, { user_Id: null }] }; // Nếu có userId, lấy các thông báo có user_Id = userId và isGlobal = false, hoặc user_Id = null

			// Lấy danh sách thông báo từ cơ sở dữ liệu
			const notifications = await NotificationModel.find(filter).sort({
				createdAt: -1,
			});

			// Kiểm tra nếu không có thông báo nào
			if (!notifications.length) {
				return res.status(200).json({
					success: true,
					message: "Không có thông báo nào!",
					data: [],
				});
			}

			// Trả về danh sách thông báo
			res.status(200).json({
				success: true,
				data: notifications,
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi lấy thông báo.",
				error: error.message,
			});
		}
	}

	async createNotifications(req, res) {
		try {
			const { title, message, image, user_Id, type } = req.body;

			// Kiểm tra dữ liệu đầu vào
			if (!title || !message || !type) {
				return res.status(400).json({
					success: false,
					message: "Tiêu đề, nội dung và loại thông báo là bắt buộc.",
				});
			}

			// Thiết lập giá trị mặc định cho isGlobal
			const isGlobal = user_Id === null ? true : false; // Nếu user_Id là null, isGlobal = true, ngược lại isGlobal = false

			// Tạo thông báo mới
			const newNotification = new NotificationModel({
				title,
				message,
				image: image || null, // Nếu không có hình ảnh, mặc định là null
				user_Id: user_Id || null, // Nếu không có userId, mặc định là thông báo chung
				type,
				isGlobal, // Sử dụng giá trị isGlobal đã xác định
			});

			// Lưu thông báo vào cơ sở dữ liệu
			await newNotification.save();

			res.status(201).json({
				success: true,
				message: "Thông báo đã được tạo thành công.",
				data: newNotification,
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi tạo thông báo.",
				error: error.message,
			});
		}
	}

	async deleteNotification(req, res) {
		try {
			const { id } = req.params; // Lấy id từ params

			// Tìm và xóa thông báo theo _id
			const deletedNotification = await NotificationModel.findByIdAndDelete(id);

			// Kiểm tra nếu không tìm thấy thông báo
			if (!deletedNotification) {
				return res.status(404).json({
					success: false,
					message: "Không tìm thấy thông báo để xóa.",
				});
			}

			// Trả về phản hồi thành công
			res.status(200).json({
				success: true,
				message: "Thông báo đã được xóa thành công.",
				data: deletedNotification,
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi xóa thông báo.",
				error: error.message,
			});
		}
	}

	async markAsRead(req, res) {
		try {
			const { id } = req.params; // Lấy id thông báo từ params
	
			// Tìm và cập nhật trạng thái isRead thành true
			const updatedNotification = await NotificationModel.findByIdAndUpdate(
				id,
				{ isRead: true },
				{ new: true } // Trả về bản ghi sau khi cập nhật
			);
	
			// Nếu không tìm thấy thông báo
			if (!updatedNotification) {
				return res.status(404).json({
					success: false,
					message: "Không tìm thấy thông báo.",
				});
			}
	
			// Trả về phản hồi thành công
			res.status(200).json({
				success: true,
				message: "Thông báo đã được đánh dấu là đã đọc.",
				data: updatedNotification,
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: "Đã xảy ra lỗi khi đánh dấu thông báo.",
				error: error.message,
			});
		}
	}

	async countUnreadNotifications(req, res) {
		try {
		  const { userId } = req.params;
	  
		  // Đếm số thông báo với isRead: false và userId khớp
		  const count = await NotificationModel.countDocuments({
			user_Id: userId,
			isRead: false,
		  });
		  
	  
		  res.status(200).json({
			success: true,
			count,
		  });
		} catch (error) {
		  res.status(500).json({
			success: false,
			message: "Đã xảy ra lỗi khi lấy thông báo.",
			error: error.message,
		  });
		}
	  }
	  
	  
	  
	
}

export default NotificationController;
