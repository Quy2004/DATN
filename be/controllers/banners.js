import Banner from "../models/BannerModel.js";

class BannerController {
  // Lấy danh sách banner
  async getBanners(req, res) {
    try {
      const banners = await Banner.find({ isDeleted: false });
      res.status(200).json(banners);
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
}

export default BannerController;
