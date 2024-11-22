import Comment from "../models/commentModel";

class CommentController {
	// list all comments

	async getAllComments(req, res) {
		try {
		  const { isDeleted = "false", status, page = 1, limit, productId } = req.query;
	  
		  // Tạo điều kiện lọc
		  const query = {
			isDeleted: isDeleted === "true", // Chuyển isDeleted thành boolean
		  };
	  
		  // Nếu có productId, thêm vào điều kiện lọc
		  if (productId) {
			query.product_id = productId;
		  }
	  
	  
		  // Xử lý logic phân trang
		  const pageLimit = parseInt(limit, 10) || 10; // Mặc định 10 nếu không có limit
		  const currentPage = parseInt(page, 10) || 1;
		  const skip = (currentPage - 1) * pageLimit; // Tính toán skip cho phân trang
	  
		  // Thực hiện truy vấn với populate để lấy thông tin sản phẩm, người dùng và bình luận cha
		  const comments = await Comment.find(query)
			.populate("parent_id", "content") // Lấy thông tin bình luận cha
			.populate("product_id", "name") // Lấy thông tin sản phẩm
			.populate("user_id", "userName") // Lấy thông tin người dùng
			.skip(skip)
			.limit(pageLimit)
			.lean();
	  
		  // Tổng số comment để tính tổng số trang
		  const totalItems = await Comment.countDocuments(query);
	  
		  res.status(200).json({
			message: "Lấy danh sách comment thành công!",
			data: comments,
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
	  

	// thêm mới size
	async createComment(req, res) {
		try {
			const comment = await Comment.create(req.body);
			res.status(201).json({
				message: "Tạocomment thành công!",
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
		  if (typeof isDeleted !== 'boolean') {
			return res.status(400).json({ message: "isDeleted phải là một giá trị boolean" });
		  }
	  
		  // Tìm bình luận và cập nhật trường isDeleted
		  const comment = await Comment.findByIdAndUpdate(
			req.params.id,
			{ isDeleted }, // Cập nhật isDeleted
			{ new: true }
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
                { new: true }
              );
              if (!comment) {
                return res.status(404).json({
                  message: "Không tìm thấy bình luận",
                });
              }
              res.status(200).json({
                message: "Xóa mềm bình luận thành công!",
                data: comment
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
                { new: true }
              );
              if (!comment) {
                return res.status(404).json({
                  message: "Không tìm thấy bình luận",
                });
              }
              res.status(200).json({
                message: "Khôi phục bình luận thành công!",
                data: comment
              });
        } catch (error) {
            res.status(400).json({
				message: error.message,
			});
        }
    }




}

export default CommentController;
