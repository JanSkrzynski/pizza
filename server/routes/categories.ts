import { Router } from "express";
import { getAllCategories, addCategory } from "../services/categories";

const router = Router();

router.get("/", async (_, res) => {
  const categories = await getAllCategories();
  res.render("categories", { categories });
});

router.get("/add", (_, res) => res.render("add-category"));

router.post("/add", async (req, res) => {
  const { name } = req.body;
  await addCategory(name);
  res.redirect("/categories");
});

export default router;
