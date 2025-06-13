import { addUser, deleteUser, getAllUsers, User } from "./services/user";
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
import { getAllCategories, Category, addCategory } from "./services/categories";
import {
  Order,
  OrderWithProducts,
  createOrder,
  getAllOrders,
  getAllOrdersWithProducts,
  getOrderByIdWithProducts,
  getThisMonthOrderCount,
  getThisYearRevenue,
  getTodayOrderCount,
  getTodayPendingOrderCount,
  updateOrderStatus,
} from "./services/orders";

const router: Router = express.Router();

// dashboard
router.get("/", async (_req: Request, res: Response) => {
  try {
    const todayCount = await getTodayOrderCount();
    const todayPendingCount = await getTodayPendingOrderCount(); // ← new
    const monthCount = await getThisMonthOrderCount();
    const yearRevenue = await getThisYearRevenue();

    res.render("dashboard", {
      todayCount,
      todayPendingCount,
      monthCount,
      yearRevenue,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).send("Failed to load dashboard");
  }
});

//Getting products
router.get("/products", async (req: Request, res: Response) => {
  const name = "Jan";
  const products: Product[] = await getAllProducts();
  res.render("products", { name, products });
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

// 1️⃣ List all orders
router.get("/orders/", async (_req, res) => {
  const orders: OrderWithProducts[] = await getAllOrdersWithProducts();
  res.render("orders", { orders });
});

// 2️⃣ Order detail
router.get(
  "/orders/:id",
  async (req, res): Promise<any> => {
    const id = parseInt(req.params.id, 10);
    const order = await getOrderByIdWithProducts(id);
    if (!order) return res.status(404).send("Order not found");
    res.render("order-detail", { order });
  }
);

// 3️⃣ Show “Place Order” form
router.get("/orders/add/new", async (req, res) => {
  // fetch products to choose from
  const products: Product[] = await getAllProducts();
  res.render("add-order", { products });
});

// 4️⃣ Handle form submission
router.post(
  "/orders/add/new",
  async (req, res): Promise<any> => {
    try {
      // req.body.products will be an object like:
      // { '0': { id: '1', quantity: '2' }, '1': { id: '5', quantity: '1' }, ... }
      const productsField = req.body.products;
      if (!productsField || typeof productsField !== "object") {
        return res.status(400).send("You must select at least one product");
      }

      // Turn into an array of { id, quantity }
      const items = Object.values(productsField).map((item: any) => ({
        id: parseInt(item.id, 10),
        quantity: parseInt(item.quantity, 10),
      }));

      // Filter out invalid entries
      const validItems = items.filter(
        (it) =>
          !isNaN(it.id) && it.id > 0 && !isNaN(it.quantity) && it.quantity > 0
      );

      if (validItems.length === 0) {
        return res.status(400).send("You must select at least one product");
      }

      // If you only support quantity=1 for now, extract IDs:
      const ids = validItems.map((it) => it.id);

      // Call your existing createOrder (which sets quantity=1)
      await createOrder(ids);

      // Or, if you’ve extended createOrder to accept quantities:
      // await createOrderWithQuantities(validItems);

      res.redirect("/orders");
    } catch (err) {
      console.error("createOrder error:", err);
      res.status(500).send("Failed to place order: " + (err as Error).message);
    }
  }
);

// POST /orders/:id/status
router.post(
  "/orders/:id/status",
  async (req, res): Promise<any> => {
    const orderId = parseInt(req.params.id, 10);
    const { status } = req.body;
    if (!status) {
      return res.status(400).send("Status is required");
    }

    try {
      await updateOrderStatus(orderId, status);
      res.redirect("/orders/" + orderId); // back to detail page
    } catch (err) {
      console.error("Status update error:", err);
      res.status(500).send("Failed to update status");
    }
  }
);

// Getting categories
// Show list of categories
router.get("/categories", async (req: Request, res: Response) => {
  const categories: Category[] = await getAllCategories();
  res.render("categories", { categories });
});

// Show “Add Category” form
router.get("/categories/add", (_req, res) => {
  res.render("add-category");
});

// Handle form submission
router.post(
  "/categories/add",
  async (req: Request, res: Response): Promise<any> => {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).send("Category name is required");
    }
    await addCategory(name.trim());
    res.redirect("/categories");
  }
);

// List all users
router.get("/users", async (_req, res) => {
  const users: User[] = await getAllUsers();
  res.render("users", { users });
});

// Show add-user form
router.get("/users/add", (_req, res) => {
  res.render("add-user");
});

// Handle new user submission
// Handle new user submission, now with password
router.post(
  "/users/add",
  async (req: Request, res: Response): Promise<any> => {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).send("Email, password and role are required");
    }

    try {
      await addUser(email.trim(), password, role.trim());
      res.redirect("/users");
    } catch (err) {
      console.error("addUser error:", err);
      res.status(500).send("Failed to create user");
    }
  }
);

router.post("users/delete/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    await deleteUser(id);
    res.redirect("/users");
  } catch (err) {
    console.error("deleteUser error:", err);
    res.status(500).send("Failed to delete user");
  }
});

export default router;
