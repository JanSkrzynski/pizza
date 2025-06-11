import express, { Request, Response, Router } from "express";
import path from "path";
import {
  addProduct,
  getAllProducts,
  getProductBySlug,
  Product,
} from "./services/products";
import { getAllCategories, Category } from "./services/categories";
import { getAllOrders } from "./services/orders";

const router: Router = express.Router();

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

router.get("/product/:slug", async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const product: Product = await getProductBySlug(slug);
  res.render("detail", { product });
});

router.get("/orders", async (req: Request, res: Response) => {
  const orders = await getAllOrders();
  res.render("orders", { orders });
});

export default router;
