import slugify from "slugify";
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
        .populate("categoryPost", "title description")
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

  // Cập nhật bài viết
  async updatePost(req, res) {
    try {
      const { id } = req.params;
      const { title } = req.body;

      // Kiểm tra xem bài viết có tồn tại hay không
      const post = await Post.findOne({ _id: id, isDeleted: false });
      if (!post) {
        return res.status(404).json({ error: "Bài viết không tồn tại." });
      }

      // Kiểm tra xem title có trùng với bất kỳ bài viết nào khác
      if (title) {
        const existingPost = await Post.findOne({
          title: title,
          _id: { $ne: id },
          isDeleted: false,
        });

        if (existingPost) {
          return res
            .status(400)
            .json({ error: "Tiêu đề bài viết đã tồn tại." });
        }

        // Cập nhật tiêu đề và slug
        post.title = title;
        post.slug = slugify(title, { lower: true, strict: true });
      }

      // Cập nhật bài viết với req.body và các trường đã thay đổi
      const updatedPost = await Post.findByIdAndUpdate(id, post, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        message: "Cập nhật bài viết thành công!",
        data: updatedPost,
      });
    } catch (error) {
      res.status(500).json({ error: "Lỗi khi cập nhật bài viết" });
    }
  }

  // Xóa mềm bài viết
  async softDeletePost(req, res) {
    try {
      const post = await Post.findByIdAndUpdate(req.params.id, {
        isDeleted: true,
      });

      if (!post) {
        return res
          .status(404)
          .json({ error: "Bài viết không tồn tại hoặc đã bị xóa." });
      }

      res.status(200).json({ message: "Bài viết đã được xóa mềm." });
    } catch (error) {
      res.status(500).json({ error: "Lỗi khi xóa mềm bài viết" });
    }
  }

  // Xóa cứng bài viết
  async hardDeletePost(req, res) {
    try {
      const { id } = req.params;
      const post = await Post.findOneAndDelete({ _id: id });

      if (!post) {
        return res.status(404).json({ error: "Bài viết không tồn tại." });
      }

      res.status(200).json({ message: "Bài viết đã được xóa cứng." });
    } catch (error) {
      res.status(500).json({ error: "Lỗi khi xóa cứng bài viết" });
    }
  }

  // Khôi phục bài viết đã xóa mềm
  async restorePost(req, res) {
    try {
      const { id } = req.params;

      // Tìm bài viết đã bị xóa mềm
      const post = await Post.findOne({ _id: id, isDeleted: true });
      if (!post) {
        return res
          .status(404)
          .json({ error: "Bài viết không tồn tại hoặc chưa bị xóa mềm." });
      }

      // Khôi phục bài viết
      post.isDeleted = false;
      await post.save();

      res
        .status(200)
        .json({ message: "Bài viết đã được khôi phục thành công." });
    } catch (error) {
      res.status(500).json({ error: "Lỗi khi khôi phục bài viết" });
    }
  }
}

export default PostController;
