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
import { requireAuth, requireAdmin } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

// everyone here must be logged in & admin
router.use(requireAuth, requireAdmin);

// 1) LIST
router.get("/", async (_req, res) => {
  const products = await getAllProducts();
  res.render("products", { products });
});

// 2) NEW FORM
router.get("/add", async (_req, res) => {
  const categories = await getAllCategories();
  res.render("add-product", { categories });
});

// 3) CREATE
router.post("/add", upload.single("image_file"), async (req, res) => {
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
});

// 4) DETAIL
router.get("/:slug", async (req, res) => {
  const product = await getProductBySlug(req.params.slug);
  if (!product) {
    res.status(404).send("Not found");
    return;
  }
  res.render("detail", { product });
});

// 5) EDIT FORM
router.get("/:slug/edit", async (req, res) => {
  const product = await getProductBySlug(req.params.slug);
  if (!product) {
    res.status(404).send("Not found");
    return;
  }
  const categories = await getAllCategories();
  res.render("edit-product", { product, categories });
});

// 6) UPDATE
router.post("/:slug/edit", upload.single("image_file"), async (req, res) => {
  const {
    id,
    name,
    description,
    price,
    slug,
    category_id,
    existing_image_url,
  } = req.body;
  const image_url = req.file ? req.file.filename : existing_image_url;
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

// 7) DELETE
router.post("/:id/delete", async (req, res) => {
  const idNum = parseInt(req.params.id, 10);
  await deleteProduct(idNum);
  res.redirect("/products");
});

export default router;
