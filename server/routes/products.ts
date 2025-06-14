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
import { upload } from "../middleware/upload";

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
router.post(
  "/add",
  upload.single("image_file"), // ← name of your <input type="file" name="image_file">
  async (req: Request, res: Response) => {
    try {
      const { name, description, price, slug, category_id } = req.body;
      const image_url = req.file ? req.file.filename : "";
      await addProduct(
        name,
        description || null,
        parseFloat(price),
        image_url,
        slug,
        parseInt(category_id, 10)
      );
      res.redirect("/products");
    } catch (err) {
      console.error("addProduct error:", err);
      res.status(500).send("Failed to add product");
    }
  }
);

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
router.post("/:slug/edit", upload.single("image_file"), async (req, res) => {
  const { id, name, description, price, slug, category_id } = req.body;
  const image_url = req.file ? req.file.filename : req.body.existing_image_url;
  await updateProduct(
    parseInt(id, 10),
    name,
    description || null,
    parseFloat(price),
    image_url,
    slug,
    parseInt(category_id, 10)
  );
  res.redirect(`/products/${slug}`);
});

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
