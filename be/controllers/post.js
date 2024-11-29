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
      // Sử dụng populate để lấy tên danh mục từ bài viết
      const post = await Post.findOne({ _id: id, isDeleted: false }).populate(
        "categoryPost"
      );

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
      const { title, categoryPost, excerpt, imagePost, galleryPost, content } =
        req.body;

      // Kiểm tra xem bài viết có tồn tại không
      const post = await Post.findOne({ _id: id, isDeleted: false });
      if (!post) {
        return res.status(404).json({ error: "Bài viết không tồn tại." });
      }

      // Kiểm tra tiêu đề trùng lặp nếu title được thay đổi
      if (title && title !== post.title) {
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

        // Cập nhật tiêu đề và tạo slug mới
        post.title = title;
        post.slug = slugify(title, { lower: true, strict: true });
      }

      // Cập nhật các trường khác nếu có thay đổi
      if (categoryPost) post.categoryPost = categoryPost;
      if (excerpt) post.excerpt = excerpt;
      if (imagePost) post.imagePost = imagePost;
      if (galleryPost) post.galleryPost = galleryPost;
      if (content) post.content = content;

      // Lưu các thay đổi vào database
      await post.save();

      res.status(200).json({
        message: "Cập nhật bài viết thành công!",
        data: post,
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
  async getRelatedPosts(req, res) {
    try {
      const { id } = req.params; // ID bài viết hiện tại
      const { limit = 5 } = req.query; // Số lượng bài viết liên quan muốn lấy

      // Lấy bài viết hiện tại
      const post = await Post.findOne({ _id: id, isDeleted: false });
      if (!post) {
        return res.status(404).json({ error: "Bài viết không tồn tại." });
      }

      // Tìm bài viết liên quan cùng categoryPost, loại trừ bài viết hiện tại
      const relatedPosts = await Post.find({
        categoryPost: post.categoryPost,
        _id: { $ne: id }, // Loại trừ bài viết hiện tại
        isDeleted: false,
      })
        .sort({ createdAt: -1 }) // Sắp xếp bài viết mới nhất
        .limit(parseInt(limit));

      res.status(200).json({
        message: "Lấy bài viết liên quan thành công!",
        data: relatedPosts,
      });
    } catch (error) {
      res.status(500).json({ error: "Lỗi khi lấy bài viết liên quan" });
    }
  }
}

export default PostController;
