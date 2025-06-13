// server/routes/products.ts
import { Router, Request, Response } from "express";
import {
  getAllProducts,
  getProductBySlug,
  addProduct,
  updateProduct,
  deleteProduct,
  Product,
} from "../services/products";
import { getAllCategories, Category } from "../services/categories";
import { requireAdmin, requireAuth } from "../middleware/auth";

const router = Router();

// Only logged-in admins may manage products
router.use(requireAuth);
router.use(requireAdmin);

// 1) List all products
router.get("/", async (_req, res) => {
  const products: Product[] = await getAllProducts();
  res.render("products", { products });
});

// 2) Show “Add Product” form
router.get("/add", async (_req, res) => {
  const categories: Category[] = await getAllCategories();
  res.render("add-product", { categories });
});

// 3) Handle “Add Product” submission
router.post("/add", async (req, res) => {
  const { name, description, price, image_url, slug, category_id } = req.body;
  const priceNum = parseFloat(price);
  const categoryNum = parseInt(category_id, 10);

  try {
    await addProduct(
      name,
      description || null,
      priceNum,
      image_url || null,
      slug,
      categoryNum
    );
    res.redirect(`/products/${slug}`);
  } catch (err) {
    console.error("addProduct error:", err);
    res.status(500).send("Failed to add product");
  }
});

// 4) Show product detail
router.get(
  "/:slug",
  async (req: Request, res: Response): Promise<void> => {
    const slug = req.params.slug;
    const product: Product = await getProductBySlug(slug);
    if (!product) {
      res.status(404).send("Product not found");
      return;
    }
    res.render("detail", { product });
  }
);

// 5) Show “Edit Product” form
router.get(
  "/:slug/edit",
  async (req: Request, res: Response): Promise<void> => {
    const slug = req.params.slug;
    const product: Product = await getProductBySlug(slug);
    if (!product) {
      res.status(404).send("Product not found");
      return;
    }
    const categories: Category[] = await getAllCategories();
    res.render("edit-product", { product, categories });
  }
);

// 6) Handle “Edit Product” submission
router.post(
  "/:slug/edit",
  async (req: Request, res: Response): Promise<void> => {
    const {
      id,
      name,
      description,
      price,
      image_url,
      slug,
      category_id,
    } = req.body;
    const priceNum = parseFloat(price);
    const categoryNum = parseInt(category_id, 10);
    const idNum = parseInt(id, 10);

    try {
      const updated = await updateProduct(
        idNum,
        name,
        description || null,
        priceNum,
        image_url || null,
        slug,
        categoryNum
      );
      res.redirect(`/products/${updated.slug}`);
    } catch (err) {
      console.error("updateProduct error:", err);
      res.status(500).send("Failed to update product");
    }
  }
);

// 7) Handle product deletion
router.post(
  "/:id/delete",
  async (req: Request, res: Response): Promise<void> => {
    const idNum = parseInt(req.params.id, 10);
    if (isNaN(idNum)) {
      res.status(400).send("Invalid product ID");
      return;
    }

    try {
      await deleteProduct(idNum);
      res.redirect("/products");
    } catch (err) {
      console.error("deleteProduct error:", err);
      res.status(500).send("Failed to delete product");
    }
  }
);

export default router;
