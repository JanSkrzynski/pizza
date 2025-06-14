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
import { createOrder } from "../services/orders";

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
    const productIds = req.body.productIds;
    if (
      !Array.isArray(productIds) ||
      productIds.some((id) => typeof id !== "number")
    ) {
      res
        .status(400)
        .json({ error: "Body must contain an array of numeric productIds" });
      return;
    }

    // associate to the logged-in user and set quantity=1 for each product
    const userId = req.session.userId;
    if (!userId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const items = productIds.map((id: number) => ({
      product_id: id,
      quantity: 1,
    }));
    const order = await createOrder(userId, items);

    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error("POST /api/orders error:", err);
    res.status(500).json({
      error: "Failed to create order",
      details: (err as Error).message,
    });
  }
});

export default router;
