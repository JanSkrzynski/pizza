import express, { Request, Response, Router } from "express";
import path from "path";
import {
  addProduct,
  getAllProducts,
  getProductBySlug,
  updateProduct,
  Product,
} from "./services/products";
import { getAllCategories, Category } from "./services/categories";
import { getAllOrders } from "./services/orders";

const router: Router = express.Router();

//Getting products
router.get("/", async (req: Request, res: Response) => {
  const name = "Jan";
  const products: Product[] = await getAllProducts();
  res.render("home", { name, products });
});

// Adding a new product
router.get("/add", async (req: Request, res: Response) => {
  const categories: Category[] = await getAllCategories();
  res.render("add-product", { categories });
});

router.post(
  "/add/product",
  async (req: Request, res: Response): Promise<void> => {
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
      res.redirect(`/product/${slug}`);
    } catch (err) {
      console.error("addProduct error:", err);
      res.status(500).send("Failed to add product: " + (err as Error).message);
    }
  }
);

//Getting one product by slug
router.get("/product/:slug", async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const product: Product = await getProductBySlug(slug);
  res.render("detail", { product });
});

// Editing a product
router.get("/edit/:slug", async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const product = await getProductBySlug(slug);
  const categories = await getAllCategories();
  res.render("edit-product", { product, categories });
});

router.post(
  "/edit/product",
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
      res.redirect(`/product/${updated.slug}`);
    } catch (err) {
      console.error("editProduct error:", err);
      res.status(500).send("Failed to edit product: " + (err as Error).message);
    }
  }
);

router.get("/orders", async (req: Request, res: Response) => {
  const orders = await getAllOrders();
  res.render("orders", { orders });
});

export default router;
