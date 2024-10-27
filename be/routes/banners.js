import express from "express";
import BannerController from "../controllers/banners";

const bannerRouter = express.Router();

const bannerController = new BannerController();
bannerRouter.get("/", bannerController.getBanners);
bannerRouter.get("/:id", bannerController.getBannerDetail);
bannerRouter.post("/", bannerController.createBanner);
bannerRouter.put("/:id", bannerController.updateBanner);
bannerRouter.patch("/:id/soft-delete", bannerController.softDeleteBanner);
bannerRouter.delete("/:id/hard-delete", bannerController.hardDeleteBanner);
bannerRouter.patch("/:id/restore", bannerController.restoreBanner);
export default bannerRouter;
