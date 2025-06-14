// server/routes/orders.ts
import { Router, Request, Response } from "express";
import {
  createOrder,
  getOrdersByUser,
  getAllOrdersWithProducts,
  getOrderByIdWithProducts,
  updateOrderStatus,
} from "../services/orders";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { getAllProducts } from "../services/products";

const router = Router();

// 1️⃣ Protect everything: must be logged in
router.use(requireAuth);
router.use(requireAdmin);

/**
 * GET /orders
 * Customer: list only their own orders
 */
router.get(
  "/",
  requireAuth,
  requireAdmin,
  async (_req: Request, res: Response): Promise<void> => {
    const orders = await getAllOrdersWithProducts();
    orders.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    res.render("orders", { orders });
  }
);

/**
 * GET /orders/all
 * Admin: list all orders
 */
router.get(
  "/all",
  requireAdmin,
  async (_req: Request, res: Response): Promise<void> => {
    const orders = await getAllOrdersWithProducts();
    orders.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    res.render("orders", { orders, title: "All Orders" });
  }
);

/**
 * GET /orders/:id
 * Order detail (products inside)
 */
router.get(
  "/:id",
  async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id, 10);
    const order = await getOrderByIdWithProducts(id);
    if (!order) {
      res.status(404).send("Order not found");
      return;
    }
    res.render("order-detail", { order });
  }
);

/**
 * GET /orders/add
 * Show “Place New Order” form
 */
router.get(
  "/add",
  async (_req: Request, res: Response): Promise<void> => {
    // need product list
    const { getAllProducts } = await import("../services/products");
    const products = await getAllProducts();
    res.render("add-order", { products });
  }
);

/**
 * POST /orders/add
 * Handle the order form (products + quantities)
 */
router.post(
  "/add",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const productsField = req.body.products;
      if (!productsField || typeof productsField !== "object") {
        res.status(400).send("You must select at least one product");
        return;
      }

      const items = Object.values(productsField).map((item: any) => ({
        id: parseInt(item.id, 10),
        qty: parseInt(item.quantity, 10),
      }));
      const validItems = items.filter((it) => it.id > 0 && it.qty > 0);

      if (validItems.length === 0) {
        res.status(400).send("You must select at least one product");
        return;
      }

      // associate to the logged-in user
      const userId = req.session.userId!;
      await createOrder(
        userId,
        validItems.map((it) => ({
          product_id: it.id,
          quantity: it.qty,
        }))
      );

      res.redirect("/orders");
    } catch (err) {
      console.error("createOrder error:", err);
      res.status(500).send("Failed to place order");
    }
  }
);

router.get("/add/new", async (req, res) => {
  const products = await getAllProducts();
  res.render("add-order", { products });
});

/**
 * POST /orders/:id/status
 * Change an order’s status (admin or staff)
 */
router.post(
  "/:id/status",
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const orderId = parseInt(req.params.id, 10);
    const { status } = req.body;
    if (!status) {
      res.status(400).send("Status is required");
      return;
    }
    try {
      await updateOrderStatus(orderId, status);
      res.redirect(`/orders/${orderId}`);
    } catch (err) {
      console.error("updateOrderStatus error:", err);
      res.status(500).send("Failed to update status");
    }
  }
);

// only require that you be logged in
router.get("/my", requireAuth, async (req, res) => {
  const userId = req.session.userId!;
  const orders = await getOrdersByUser(userId);
  res.render("my-orders", { orders });
});

// handle the form on that same page
router.post("/my", requireAuth, async (req, res) => {
  const userId = req.session.userId!;
  const productIds = req.body.productIds as number[];
  // (validate productIds array as before…)
  await createOrder(
    userId,
    productIds.map((id) => ({ product_id: id, quantity: 1 }))
  );
  res.redirect("/my-orders");
});

export default router;
