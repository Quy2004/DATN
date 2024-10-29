import Banner from "../models/BannerModel.js";

class BannerController {
  // Lấy danh sách banner
  async getBanners(req, res) {
    try {
      const { page = 1, limit = 10, search, isDeleted } = req.query;

      const query = {};

      // Tìm kiếm theo tiêu đề banner, không phân biệt chữ hoa thường
      if (search) {
        query.title = { $regex: search, $options: "i" };
      }

      // Lọc theo trạng thái xóa mềm
      if (isDeleted !== undefined) {
        query.isDeleted = isDeleted === "true";
      }

      // Truy vấn tìm banner và áp dụng phân trang
      const banners = await Banner.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
      const total = await Banner.countDocuments(query);

      res.status(200).json({
        message: "Lấy danh sách banner thành công!!!",
        data: banners,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      res.status(500).json({ error: "Lỗi khi lấy danh sách banner" });
    }
  }

  // Lấy chi tiết một banner
  async getBannerDetail(req, res) {
    try {
      const { id } = req.params;
      const banner = await Banner.findOne({ _id: id, isDeleted: false });

      if (!banner) {
        return res.status(404).json({ error: "Banner không tồn tại." });
      }

      res.status(200).json(banner);
    } catch (error) {
      res.status(500).json({ error: "Lỗi khi lấy chi tiết banner" });
    }
  }

  // Tạo banner mới
  async createBanner(req, res) {
    try {
      const { title } = req.body;

      const existingBanner = await Banner.findOne({ title, isDeleted: false });

      if (existingBanner) {
        return res.status(400).json({ error: "Title đã tồn tại." });
      }

      const newBanner = new Banner(req.body);
      await newBanner.save();
      res.status(201).json(newBanner);
    } catch (error) {
      res.status(500).json({ error: "Lỗi khi tạo banner" });
    }
  }
  // Cập nhật banner
  async updateBanner(req, res) {
    try {
      const { id } = req.params;
      const { title } = req.body;

      // Kiểm tra xem banner có tồn tại hay không
      const banner = await Banner.findOne({ _id: id, isDeleted: false });
      if (!banner) {
        return res.status(404).json({ error: "Banner không tồn tại." });
      }

      // Kiểm tra xem title có trùng với bất kỳ banner nào khác
      if (title) {
        const existingBanner = await Banner.findOne({
          title: title,
          _id: { $ne: id },
          isDeleted: false,
        });

        if (existingBanner) {
          return res.status(400).json({ error: "Tên banner đã tồn tại." });
        }
      }

      // Cập nhật banner
      const updatedBanner = await Banner.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      res.status(200).json(updatedBanner);
    } catch (error) {
      res.status(500).json({ error: "Lỗi khi lấy cập nhật banner" });
    }
  }

  // Xóa mềm banner
  async softDeleteBanner(req, res) {
    try {
      const banner = await Banner.findByIdAndUpdate(req.params.id, {
        isDeleted: true,
      });

      if (!banner) {
        return res
          .status(404)
          .json({ error: "Banner không tồn tại hoặc đã bị xóa." });
      }

      res.status(200).json({ message: "Banner đã được xóa mềm." });
    } catch (error) {
      res.status(500).json({ error: "Lỗi khi xóa mềm banner" });
    }
  }

  // Xóa cứng banner
  async hardDeleteBanner(req, res) {
    try {
      const { id } = req.params;
      const banner = await Banner.findOneAndDelete({ _id: id });

      if (!banner) {
        return res.status(404).json({ error: "Banner không tồn tại." });
      }

      res.status(200).json({ message: "Banner đã được xóa cứng." });
    } catch (error) {
      res.status(500).json({ error: "Lỗi khi xóa cứng banner" });
    }
  }

  // Khôi phục banner đã xóa mềm
  async restoreBanner(req, res) {
    try {
      const { id } = req.params;

      // Tìm banner đã bị xóa mềm
      const banner = await Banner.findOne({ _id: id, isDeleted: true });
      if (!banner) {
        return res
          .status(404)
          .json({ error: "Banner không tồn tại hoặc chưa bị xóa mềm." });
      }

      // Khôi phục banner
      banner.isDeleted = false;
      await banner.save();

      res.status(200).json({ message: "Banner đã được khôi phục thành công." });
    } catch (error) {
      res.status(500).json({ error: "Lỗi khi khôi phục banner" });
    }
  }
}

export default BannerController;
