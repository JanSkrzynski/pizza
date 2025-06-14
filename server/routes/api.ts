// server/routes/api.ts
import { Router, Request, Response } from "express";
import {
  getAllProducts,
  getProductsByCategory,
  getProductBySlug,
  Product,
} from "../services/products";
import { getAllCategories } from "../services/categories";
// If you want orders to be tied to users, use createOrder below.
// If you still have the old simple version, you can import that instead:
// import { createOrderSimple as createOrder } from "../services/orders";
import { createOrder, createOrderSimple } from "../services/orders";

const router = Router();

/**
 * GET /api/categories
 */
router.get("/categories", async (_req, res) => {
  const categories = await getAllCategories();
  res.json(categories);
});

/**
 * GET /api/products?category=ID
 */
router.get("/products", async (req, res) => {
  try {
    const catQ = req.query.category as string | undefined;
    let products: Product[];

    if (catQ !== undefined) {
      const categoryId = parseInt(catQ, 10);
      if (isNaN(categoryId)) {
        res.status(400).json({ error: "Invalid category query parameter" });
        return;
      }
      products = await getProductsByCategory(categoryId);
    } else {
      products = await getAllProducts();
    }
    res.json(products);
  } catch (err) {
    console.error("GET /api/products error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

/**
 * GET /api/products/:slug
 */
router.get("/products/:slug", async (req, res) => {
  const slug = req.params.slug;
  const product = await getProductBySlug(slug);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(product);
});

/**
 * POST /api/orders
 * Body: { productIds: number[] }
 */
router.post("/orders", async (req, res) => {
  try {
    // First, see if the client sent detailed items
    const items = req.body.items as
      | { product_id: number; quantity: number }[]
      | undefined;

    if (items) {
      // **New signature**: createOrder(userId, items[])
      const userId = req.body.userId as string;
      if (!userId) {
        res.status(400).json({ error: "Must include userId" });
        return;
      }
      // validate items
      if (
        !Array.isArray(items) ||
        items.some(
          (it) =>
            typeof it.product_id !== "number" || typeof it.quantity !== "number"
        )
      ) {
        res
          .status(400)
          .json({ error: "items must be [{ product_id, quantity }, ...]" });
        return;
      }
      const order = await createOrder(userId, items);
      res.status(201).json({ success: true, order });
      return;
    }

    // Fallback: old simple API
    const productIds = req.body.productIds as number[] | undefined;
    if (
      !Array.isArray(productIds) ||
      productIds.some((id) => typeof id !== "number")
    ) {
      res
        .status(400)
        .json({ error: "Request must include productIds or items" });
      return;
    }
    const order = await createOrderSimple(productIds);
    res.status(201).json({ success: true, order });
  } catch (err: any) {
    console.error("POST /api/orders error:", err);
    res
      .status(500)
      .json({ error: "Failed to create order", details: err.message });
  }
});

export default router;
