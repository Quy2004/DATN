import CategoryPost from "../models/categoryPostModel";

class CategoryPostController {
	// hiển thị, lọc, search category post
	async getAllCategoryPosts(req, res) {
		try {
			const { page = 1, limit = 10, search = "", isDeleted } = req.query;

			// tạo lọc
			const query = {
				isDeleted: isDeleted === "true" ? true : false,
			};

			if (search) {
				query.title = { $regex: search, $options: "i" };
			}

			// phân trang
			const pageLimit = parseInt(limit, 10) || 10;
			const currentPage = parseInt(page, 10) || 1;

			// thực hiện query để lấy danh sách với limit và skip
			const categoryPosts = await CategoryPost.find(query)
				.limit(pageLimit)
				.skip((currentPage - 1) * pageLimit)
				.lean();

			// tổng số danh mục để tính tổng số trang
			const totalItems = await CategoryPost.countDocuments(query);
			res.status(200).json({
				message: "Lấy danh mục post thành công",
				data: categoryPosts,
				pagination: {
					totalItems: totalItems,
					currentPage: currentPage,
					totalPages: Math.ceil(totalItems / pageLimit),
				},
			});
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	}

	// hiển thị chi tiết 1 danh mục
	async getCategoryById(req, res) {
		try {
			const { id } = req.params;
			const categoryPost = await CategoryPost.findById(id);
			if (!categoryPost) {
				return res
					.status(404)
					.json({ message: "category post không tìm thấy" });
			}
			res.status(200).json({
				message: "Get category post Details Done",
				data: categoryPost,
			});
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	}

	// Thêm category post mới
	async createCategoryPost(req, res) {
		try {
			const { title, description, thumbnail, isDeleted } = req.body;

			const categoryPost = await CategoryPost.create({
				title,
				description,
				thumbnail,
				isDeleted,
			});

			res.status(201).json({
				message: "Thêm danh mục bài đăng thành công",
				data: categoryPost,
			});
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	}

	// sửa 1 danh mục
	async updateCategoryPost(req, res) {
		try {
			const categoryPost = await CategoryPost.findByIdAndUpdate(
				req.params.id,
				req.body,
				{
					new: true,
				},
			);
			if (!categoryPost) {
				return res
					.status(404)
					.json({ message: "Category post không tìm thấy" });
			}
			res.status(200).json({
				message: "Update category post Successfully",
				data: categoryPost,
			});
		} catch (error) {
			res.status(400).json({ message: error.message });
		}
	}

    // Xóa cứng
    async deleteCategoryPost(req, res){
        try {
            const {id}= req.params;
            const categoryPost= await CategoryPost.findByIdAndDelete({_id: id});
            res.status(201).json({
                message: "Delete category post Successfully",
              });
        } catch (error) {
            res.status(400).json({ message: error.message });
		
        }
    }


    // xóa mềm
    async softDeleteCategoryPost(req, res){
        try {
            const categoryPost = await CategoryPost.findByIdAndUpdate(
                req.params.id,
                { isDeleted: true },
                { new: true }
            )
            if (!categoryPost) {
				return res
					.status(404)
					.json({ message: "Category post không tìm thấy" });
			}
			res.status(200).json({
				message: "Soft delete category post Successfully",
				data: categoryPost,
			});
        } catch (error) {
            res.status(400).json({ message: error.message });
		
        }
    }

    // khôi phục
    async restoreCategoryPost(req, res){
        try {
            const categoryPost = await CategoryPost.findByIdAndUpdate(
                req.params.id,
                { isDeleted: false },
                { new: true }
            )
            if (!categoryPost) {
				return res
					.status(404)
					.json({ message: "Category post không tìm thấy" });
			}
			res.status(200).json({
				message: "Restore category post Successfully",
				data: categoryPost,
			});
        } catch (error) {
            res.status(400).json({ message: error.message });
		
        }
    }
}

export default CategoryPostController;
