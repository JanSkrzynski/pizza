import express, { Request, Response, Router } from "express";
import path from "path";
import {
  addProduct,
  getAllProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  Product,
} from "./services/products";
import { getAllCategories, Category } from "./services/categories";
import {
  Order,
  OrderWithProducts,
  getAllOrders,
  getAllOrdersWithProducts,
  getOrderByIdWithProducts,
  getThisMonthOrderCount,
  getThisYearRevenue,
  getTodayOrderCount,
} from "./services/orders";

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

router.post("/add/product", async (req: Request, res: Response) => {
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
});

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

//Deleting product
router.post(
  "/delete/product",
  async (req: Request, res: Response): Promise<void> => {
    const idNum = parseInt(req.body.productId, 10);
    if (isNaN(idNum)) {
      res.status(400).send("Invalid product ID");
      return;
    }

    try {
      await deleteProduct(idNum);
      res.redirect("/"); // back to home list
    } catch (err) {
      console.error("deleteProduct error:", err);
      res.status(500).send("Failed to delete product");
    }
  }
);

// Getting all orders

router.get("/orders/", async (req: Request, res: Response) => {
  let orders: OrderWithProducts[] = await getAllOrdersWithProducts();
  orders = orders.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  res.render("orders", { orders });
});

router.get(
  "/orders/:id",
  async (req: Request, res: Response): Promise<any> => {
    const id = parseInt(req.params.id, 10);
    const order = await getOrderByIdWithProducts(id);
    if (!order) return res.status(404).send("Order not found");
    res.render("order-detail", { order });
  }
);

// dashboard
router.get("/dashboard", async (_req: Request, res: Response) => {
  try {
    const todayCount = await getTodayOrderCount();
    const monthCount = await getThisMonthOrderCount();
    const yearRevenue = await getThisYearRevenue();
    res.render("dashboard", { todayCount, monthCount, yearRevenue });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).send("Failed to load dashboard");
  }
});

export default router;
