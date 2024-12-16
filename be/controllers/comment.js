import Comment from "../models/commentModel";
import NotificationModel from "../models/NotificationModel";

class CommentController {
	// list all comments

	async getAllComments(req, res) {
		try {
			const {
				isDeleted = "false",
				search = "",
				page = 1,
				limit,
				productId,
			} = req.query;

			// Tạo điều kiện lọc
			const query = {
				isDeleted: isDeleted === "true", // Chuyển isDeleted thành boolean
				parent_id: null, // Thêm điều kiện lọc để chỉ lấy các bình luận gốc (parent_id: null)
			};

			// Nếu có productId, thêm vào điều kiện lọc
			if (productId) {
				query.product_id = productId;
			}

			if (search) {
				query.content = { $regex: search, $options: "i" }; // Tìm kiếm theo nội dung
			}

			// Xử lý logic phân trang
			const pageLimit = parseInt(limit, 10) || 10; // Mặc định 10 nếu không có limit
			const currentPage = parseInt(page, 10) || 1;
			const skip = (currentPage - 1) * pageLimit; // Tính toán skip cho phân trang

			// Thực hiện truy vấn với populate để lấy thông tin sản phẩm, người dùng và bình luận cha
			const comments = await Comment.find(query)
				.populate("parent_id", "content") // Lấy thông tin bình luận cha
				.populate("product_id", "_id name") // Lấy thông tin sản phẩm
				.populate("user_id", "_id userName avatars") // Lấy thông tin người dùng
				.skip(skip)
				.limit(pageLimit).sort({ createdAt: -1 })
				.lean();

			// Chuyển đổi định dạng dữ liệu trả về
			const formattedComments = comments.map(comment => ({
				...comment,
				productId: comment.product_id?._id, // Lấy ID của product
				userId: comment.user_id?._id, // Lấy ID của user
				product_id: {
					productId: comment.product_id?._id,
					name: comment.product_id?.name,
				},
				user_id: {
					userId: comment.user_id?._id,
					userName: comment.user_id?.userName,
				},
			}));

			// Tổng số comment để tính tổng số trang
			const totalItems = await Comment.countDocuments(query);

			res.status(200).json({
				message: "Lấy danh sách comment thành công!",
				data: formattedComments,
				pagination: {
					totalItems,
					currentPage,
					totalPages: Math.ceil(totalItems / pageLimit),
				},
			});
		} catch (error) {
			res.status(400).json({
				message: error.message,
			});
		}
	}

	async GetById(req, res) {
		try {
			const { id } = req.params;
			// Kiểm tra id có tồn tại hay không
			if (!id) {
				return res.status(400).json({ message: "ID không được để trống" });
			  }
		  
			  // Tìm bình luận theo ID, đồng thời populate thông tin người dùng và sản phẩm liên quan
			  const comment = await Comment.findById(id)
				.populate("user_id", "userName email") // Populate user_id lấy userName và email
				.populate("product_id", "name image price"); // Populate product_id lấy name
		  
			  // Nếu không tìm thấy bình luận
			  if (!comment) {
				return res.status(404).json({ message: "Không tìm thấy bình luận" });
			  }
		  
			  // Trả về dữ liệu bình luận chi tiết
			  res.status(200).json({
				message: "Lấy chi tiết bình luận thành công",
				data: comment,
			  });
		} catch (error) {
			res.status(400).json({
				message: error.message,
			});
		}
	}

	async getCommentParent(req, res) {
		try {
		  const { parent_id } = req.params; // Lấy parent_id từ URL params
	  
		  // Kiểm tra nếu không có parent_id trong request
		  if (!parent_id) {
			return res.status(400).json({ message: "parent_id is required" });
		  }
	  
		  // Tìm tất cả các bình luận có parent_id tương ứng
		  const comments = await Comment.find({ parent_id })
			.populate("product_id") // Nếu bạn muốn lấy thông tin sản phẩm liên quan
			.populate("user_id") // Nếu bạn muốn lấy thông tin người dùng liên quan
			.sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo giảm dần (tùy chọn)
	  
		  // Kiểm tra nếu không tìm thấy bình luận nào
		  if (comments.length === 0) {
			return res
			  .status(404)
			  .json({ message: "No comments found for this parent_id" });
		  }
	  
		  // Trả về danh sách bình luận
		  return res.status(200).json(comments);
		} catch (error) {
		  console.error(error);
		  return res.status(500).json({ message: "Server error", error });
		}
	  }
	  

	//   hiển thị theo sản phẩm
	async getCommentProduct(req, res) {
		try {
			const { product_id } = req.params; // Lấy product_id từ URL params

			// Kiểm tra nếu không có product_id trong request
			if (!product_id) {
				return res.status(400).json({ message: "product_id is required" });
			}

			// Tìm tất cả các bình luận có product_id tương ứng
			const comments = await Comment.find({ product_id })
				.populate("parent_id", "content") // Lấy thông tin bình luận cha
				.populate("product_id", "_id name") // Lấy thông tin sản phẩm
				.populate("user_id", "_id userName avatars") // Lấy thông tin người dùng
				.sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo giảm dần (tùy chọn)

			// Kiểm tra nếu không tìm thấy bình luận nào
			if (comments.length === 0) {
				return res
					.status(404)
					.json({ message: "No comments found for this product_id" });
			}

			// Trả về danh sách bình luận
			return res.status(200).json(comments);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Server error", error });
		}
	}

	// thêm mới size
	// thêm mới comment
	async createComment(req, res) {
		try {
			const { parent_id, product_id } = req.body;

			// Tạo comment
			const comment = await Comment.create(req.body);

			// Kiểm tra nếu có parent_id (bình luận trả lời)
			if (parent_id) {
				// Lấy thông tin comment cha (nếu có)
				const parentComment = await Comment.findById(parent_id);
				if (!parentComment) {
					return res.status(404).json({
						message: "Bình luận cha không tồn tại",
					});
				}

				// Tạo thông báo cho chủ cửa hàng về bình luận trả lời
				const notification = {
					title: "Phản hồi cho bình luận của bạn",
					message: "Chủ cửa hàng đã phản hồi bình luận của bạn. Hãy xem ngay để biết thêm chi tiết.",
					user_Id: parentComment.user_id, // Người nhận thông báo là người tạo bình luận cha
					product_Id: parentComment.product_id, // Người nhận thông báo là người tạo bình luận cha
					type: "general", // Loại thông báo
					isRead: false,
					isGlobal: true,
					status: "active",
				};

				// Giả sử bạn có một model Notification để tạo thông báo
				await NotificationModel.create(notification);
			}

			res.status(201).json({
				message: "Tạo comment thành công!",
				data: comment,
			});
		} catch (error) {
			res.status(400).json({
				message: error.message,
			});
		}
	}

	// //   khóa comment
	// async lookComment(req, res) {
	// 	try {
	// 		const { id } = req.params;

	// 		// Tìm bình luận theo ID
	// 		const comment = await Comment.findById(id);

	// 		if (!comment) {
	// 			return res.status(404).json({ message: "Bình luận không tồn tại" });
	// 		}

	// 		// Kiểm tra nếu bình luận đã có trạng thái là "inactive"
	// 		if (comment.status === "inactive") {
	// 			return res.status(400).json({ message: "Bình luận này đã bị khóa" });
	// 		}

	// 		// Cập nhật trạng thái của bình luận
	// 		const updatedComment = await Comment.findByIdAndUpdate(
	// 			id,
	// 			{ status: "inactive" },
	// 			{ new: true }, // Trả về bình luận đã cập nhật
	// 		);

	// 		res.status(200).json({
	// 			message: "Bình luận đã bị khóa thành công",
	// 			data: updatedComment,
	// 		});
	// 	} catch (error) {
	// 		res.status(400).json({
	// 			message: error.message,
	// 		});
	// 	}
	// }

	// //   mở khóa comment
	// async unLookComment(req, res) {
	// 	try {
	// 		const { id } = req.params;

	// 		// Tìm bình luận theo ID
	// 		const comment = await Comment.findById(id);

	// 		if (!comment) {
	// 			return res.status(404).json({ message: "Bình luận không tồn tại" });
	// 		}

	// 		// Kiểm tra nếu bình luận đã có trạng thái là "inactive"
	// 		if (comment.status === "active") {
	// 			return res.status(400).json({ message: "Bình luận này không bị khóa" });
	// 		}

	// 		// Cập nhật trạng thái của bình luận
	// 		const updatedComment = await Comment.findByIdAndUpdate(
	// 			id,
	// 			{ status: "active" },
	// 			{ new: true }, // Trả về bình luận đã cập nhật
	// 		);

	// 		res.status(200).json({
	// 			message: "Bình luận đã mở khóa thành công",
	// 			data: updatedComment,
	// 		});
	// 	} catch (error) {
	// 		res.status(400).json({
	// 			message: error.message,
	// 		});
	// 	}
	// }

	async updateStatusComment(req, res) {
		try {
			const { isDeleted } = req.body;

			// Kiểm tra xem giá trị isDeleted có hợp lệ không
			if (typeof isDeleted !== "boolean") {
				return res
					.status(400)
					.json({ message: "isDeleted phải là một giá trị boolean" });
			}

			// Tìm bình luận và cập nhật trường isDeleted
			const comment = await Comment.findByIdAndUpdate(
				req.params.id,
				{ isDeleted }, // Cập nhật isDeleted
				{ new: true },
			);

			if (!comment) {
				return res.status(404).json({ message: "Không tìm thấy bình luận" });
			}

			res.status(200).json({
				message: "Cập nhật trạng thái isDeleted của bình luận thành công",
				data: comment,
			});
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	}

	// xóa mềm
	async softDeleteComment(req, res) {
		try {
			const comment = await Comment.findByIdAndUpdate(
				req.params.id,
				{ isDeleted: true }, // Đánh dấu là xóa mềm
				{ new: true },
			);
			if (!comment) {
				return res.status(404).json({
					message: "Không tìm thấy bình luận",
				});
			}
			res.status(200).json({
				message: "Xóa mềm bình luận thành công!",
				data: comment,
			});
		} catch (error) {
			res.status(400).json({
				message: error.message,
			});
		}
	}

	// khôi phục
	async remoteComment(req, res) {
		try {
			const comment = await Comment.findByIdAndUpdate(
				req.params.id,
				{ isDeleted: false }, // Đánh dấu là khôi phục
				{ new: true },
			);
			if (!comment) {
				return res.status(404).json({
					message: "Không tìm thấy bình luận",
				});
			}
			res.status(200).json({
				message: "Khôi phục bình luận thành công!",
				data: comment,
			});
		} catch (error) {
			res.status(400).json({
				message: error.message,
			});
		}
	}

	// xóa vĩnh viễn
	async deleteComment(req, res) {
		try {
			// Lấy commentId từ params trong request
			const { id } = req.params;

			// Tìm và xóa bình luận theo ID
			const comment = await Comment.findByIdAndDelete(id);

			// Kiểm tra nếu không tìm thấy comment
			if (!comment) {
				return res.status(404).json({ message: "Bình luận không tồn tại" });
			}

			// Trả về thông báo thành công
			res.status(200).json({ message: "Bình luận đã được xóa thành công" });
		} catch (error) {
			// Xử lý lỗi và trả về thông báo lỗi
			res.status(400).json({ message: error.message });
		}
	}
}

export default CommentController;
