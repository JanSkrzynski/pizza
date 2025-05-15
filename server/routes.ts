import express, { Request, Response, Router } from "express";
import path from "path";
import { getAllProducts, getProductBySlug, Product } from "./services/products";

const router: Router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const name = "Jan";
  const products: Product[] = await getAllProducts();
  res.render("home", { name, products });
});

router.get("/product/:slug", async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const product: Product = await getProductBySlug(slug);
  res.render("detail", { product: product });
});

export default router;
