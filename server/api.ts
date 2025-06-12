import { Product } from "./services/products";
// src/api.ts (or at the bottom of your existing routes file)
import express, { Request, Response, Router } from "express";
import { getAllCategories } from "./services/categories";
import { getAllProducts } from "./services/products";
import { createOrder } from "./services/orders"; // You’ll define this
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

//GET /api/products?categoryId=2
apiRouter.get("/products", async (req: Request, res: Response) => {
  const categoryId = parseInt(req.query.categoryId as string, 10);
  const allProducts: Product[] = await getAllProducts();
  const filtered = allProducts.filter((p) => p.category_id === categoryId);
  res.json(filtered);
});

// // POST /api/orders
// apiRouter.post("/orders", async (req: Request, res: Response) => {
//   const { productIds } = req.body;

//   if (!Array.isArray(productIds) || productIds.length === 0) {
//     return res
//       .status(400)
//       .json({ error: "productIds must be a non-empty array" });
//   }

//   try {
//     const order = await createOrder(productIds); // You’ll define this
//     res.status(201).json({ success: true, order });
//   } catch (err) {
//     console.error("createOrder error:", err);
//     res.status(500).json({ error: "Failed to place order" });
//   }
// });

export default apiRouter;
