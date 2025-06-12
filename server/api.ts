import { Product } from "./services/products";
// src/api.ts (or at the bottom of your existing routes file)
import express, { Request, Response, Router } from "express";
import { getAllCategories } from "./services/categories";
import { getAllProducts } from "./services/products";
// import { createOrder } from "./services/orders"; // You’ll define this
const apiRouter = Router();

// GET /api/categories
apiRouter.get("/categories", async (req: Request, res: Response) => {
  const categories = await getAllCategories();
  res.json(categories);
});

apiRouter.get("/products", async (req: Request, res: Response) => {
  const allProducts: Product[] = await getAllProducts();
  res.json(allProducts);
});

// GET /api/products/:slug
apiRouter.get("/products/:slug", async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const allProducts: Product[] = await getAllProducts();
  const product = allProducts.find((p) => p.slug === slug);
  res.json(product);
});

export default apiRouter;
