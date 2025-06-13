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

const router = Router();

// 1️⃣ Protect everything: must be logged in
router.use(requireAuth);

/**
 * GET /orders
 * Customer: list only their own orders
 */
router.get(
  "/",
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.session.userId!;
    const orders = await getOrdersByUser(userId);
    res.render("orders", { orders, title: "My Orders" });
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
      // parse the nested products[...] structure
      const productsField = req.body.products;
      if (!productsField || typeof productsField !== "object") {
        res.status(400).send("You must select at least one product");
        return;
      }

      const items = Object.values(productsField).map((item: any) => ({
        id: parseInt(item.id, 10),
        qty: parseInt(item.quantity, 10),
      }));
      const validIds = items
        .filter((it) => it.id > 0 && it.qty > 0)
        .map((it) => it.id);

      if (validIds.length === 0) {
        res.status(400).send("You must select at least one product");
        return;
      }

      // associate to the logged-in user
      const userId = req.session.userId!;
      await createOrder(validIds, userId);

      res.redirect("/orders");
    } catch (err) {
      console.error("createOrder error:", err);
      res.status(500).send("Failed to place order");
    }
  }
);

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

export default router;
