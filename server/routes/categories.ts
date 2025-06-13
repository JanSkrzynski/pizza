import { Router, Request, Response } from "express";
import {
  addCategory,
  Category,
  getAllCategories,
} from "../services/categories";

const router: Router = Router();

// Getting categories
// Show list of categories
router.get("/", async (req: Request, res: Response) => {
  const categories: Category[] = await getAllCategories();
  res.render("categories", { categories });
});

// Show “Add Category” form
router.get("/add", (_req, res) => {
  res.render("add-category");
});

// Handle form submission
router.post(
  "/add",
  async (req: Request, res: Response): Promise<any> => {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).send("Category name is required");
    }
    await addCategory(name.trim());
    res.redirect("/categories");
  }
);

export default router;
