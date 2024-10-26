import CategoryPost from "../models/categoryPostModel";

class CategoryPostController {
	// hiển thị, lọc, search category post
	async getAllCategoryPosts(req, res) {
		try {
			const {
				page = 1,
				limit = 10,
				search = "",
				isDeleted,
			} = req.query;

            // tạo lọc
            const query = {
                isDeleted: isDeleted === "true"? true : false,
            }

            if(search){
                query.title= {$regex: search, $options: "i"}
            }

            // phân trang
            const pageLimit = parseInt(limit, 10) ||10
            const currentPage = parseInt(page, 10) || 1

            // thực hiện query để lấy danh sách với limit và skip
            const categoryPosts = await CategoryPost.findOne(query)
            .limit(pageLimit)
            .skip((currentPage - 1) * pageLimit)
            .lean()

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

    // Thêm category post mới
    async createCategoryPost(req, res) {
        try {
            const { title, description, thumbnail, isDeleted } = req.body;
            
            const categoryPost = await CategoryPost.create({
                title,
                description,
                thumbnail,
                isDeleted
            });
    
            res.status(201).json({
                message: "Thêm danh mục bài đăng thành công",
                data: categoryPost,
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    

}

export default CategoryPostController;
