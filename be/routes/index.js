import { Router } from "express";
import categoriesRouter from "./categories.js";

const router = Router();

router.get("/", (req, res) => {
  res.send("Home");
});

router.use("/categories", categoriesRouter);
export default router;
