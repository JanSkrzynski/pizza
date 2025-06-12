import express, { Request, Response, Router } from "express";
//import { createOrder } from "./services/orders";
import {
  getAllProducts,
  getProductBySlug,
  addProduct,
  deleteProduct,
  Product,
  getProductsByCategory,
} from "./services/products";
import { getAllCategories } from "./services/categories";
import { createOrder } from "./services/orders";

const apiRouter: Router = express.Router();

// GET /api/categories
apiRouter.get("/categories", async (req: Request, res: Response) => {
  const categories = await getAllCategories();
  res.json(categories);
});

apiRouter.get(
  "/products",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const catQ = req.query.category as string | undefined;
      let products: Product[];

      if (catQ !== undefined) {
        const categoryId = parseInt(catQ, 10);
        if (isNaN(categoryId)) {
          return res
            .status(400)
            .json({ error: "Invalid category query parameter" });
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

// GET /api/products/:slug
apiRouter.get("/products/:slug", async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const allProducts: Product[] = await getAllProducts();
  const product = allProducts.find((p) => p.slug === slug);
  res.json(product);
});

// POST / api / orders;
apiRouter.post(
  "/orders",
  async (req: Request, res: Response): Promise<any> => {
    try {
      // Expecting { productIds: number[] } in the body
      const { productIds } = req.body;
      if (
        !productIds ||
        !Array.isArray(productIds) ||
        productIds.some((id: any) => typeof id !== "number")
      ) {
        return res
          .status(400)
          .json({ error: "Body must contain an array of numeric productIds" });
      }

      const order = await createOrder(productIds);
      return res.status(201).json({ success: true, order });
    } catch (err) {
      console.error("POST /api/orders error:", err);
      return res.status(500).json({
        error: "Failed to create order",
        details: (err as Error).message,
      });
    }
  }
);

export default apiRouter;
