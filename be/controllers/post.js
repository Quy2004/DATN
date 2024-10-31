import Post from "../models/PostModel.js";

class PostController {
  // Lấy danh sách bài viết
  async getAllPosts(req, res) {
    try {
      const { page = 1, limit = 10, search, isDeleted } = req.query;

      const query = {};

      if (search) {
        query.title = { $regex: search, $options: "i" };
      }

      if (isDeleted !== undefined) {
        query.isDeleted = isDeleted === "true";
      }

      const posts = await Post.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
      const total = await Post.countDocuments(query);

      res.status(200).json({
        message: "Lấy danh sách bài viết thành công!",
        data: posts,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      res.status(500).json({ error: "Lỗi khi lấy danh sách bài viết" });
    }
  }

  // Lấy chi tiết một bài viết
  async getPostDetail(req, res) {
    try {
      const { id } = req.params;
      const post = await Post.findOne({ _id: id, isDeleted: false });

      if (!post) {
        return res.status(404).json({ error: "Bài viết không tồn tại." });
      }

      res.status(200).json({
        message: "Lấy chi tiết bài viết thành công!",
        data: post,
      });
    } catch (error) {
      res.status(500).json({ error: "Lỗi khi lấy chi tiết bài viết" });
    }
  }

  // Tạo bài viết mới
  async createPost(req, res) {
    try {
      const { title } = req.body;

      const existingPost = await Post.findOne({ title, isDeleted: false });

      if (existingPost) {
        return res.status(400).json({ error: "Tiêu đề đã tồn tại." });
      }

      const newPost = new Post(req.body);
      await newPost.save();
      res.status(201).json({
        message: "Thêm bài viết thành công!",
        data: newPost,
      });
    } catch (error) {
      res.status(500).json({ error: "Lỗi khi tạo bài viết" });
    }
  }
}

export default PostController;
