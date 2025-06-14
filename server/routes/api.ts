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
router.get(
  "/categories",
  async (_req: Request, res: Response): Promise<void> => {
    const categories = await getAllCategories();
    res.json(categories);
  }
);

/**
 * GET /api/products
 * Optional ?category=ID
 */
router.get(
  "/products",
  async (req: Request, res: Response): Promise<void> => {
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
  }
);

/**
 * GET /api/products/:slug
 */
router.get(
  "/products/:slug",
  async (req: Request, res: Response): Promise<void> => {
    const slug = req.params.slug;
    const product = await getProductBySlug(slug);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(product);
  }
);

/**
 * POST /api/orders
 * Body: { items: { product_id: number; quantity: number }[] }
 */
router.post(
  "/orders",
  async (req: Request, res: Response): Promise<void> => {
    try {
      // You can either:
      // 1) Expect the new signature: { items: [{product_id, quantity}, ...] }
      //    and pass the currently-logged-in user (if you have sessions).
      //
      //    const items = req.body.items as { product_id: number; quantity: number }[];
      //    const userId = req.session.userId!;
      //    const order = await createOrder(userId, items);
      //
      // 2) Or, if you haven’t wired up sessions here, use the old simple version:
      //    import { createOrderSimple as createOrder } from "../services/orders";
      //    const productIds = req.body.productIds as number[];
      //    const order = await createOrder(productIds);

      // Example for simple array of IDs:
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

      // Use the new signature: userId and items array
      const userId = req.session.userId;
      if (!userId) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }
      // Convert productIds to items with quantity 1
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
  }
);

export default router;
