import express from "express";
import BannerController from "../controllers/banners";

const bannerRouter = express.Router();

const bannerController = new BannerController();
bannerRouter.get("/", bannerController.getBanners);
bannerRouter.get("/:id", bannerController.getBannerDetail);
bannerRouter.post("/", bannerController.createBanner);
export default bannerRouter;
