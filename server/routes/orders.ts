import { Router, Request, Response } from "express";
import {
  createOrder,
  getAllOrdersWithProducts,
  getOrderByIdWithProducts,
  OrderWithProducts,
  updateOrderStatus,
} from "../services/orders";
import { getAllProducts, Product } from "../services/products";

const router: Router = Router();

// Getting all orders
router.get("/", async (req: Request, res: Response) => {
  let orders: OrderWithProducts[] = await getAllOrdersWithProducts();
  orders = orders.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  res.render("orders", { orders });
});

// 1️⃣ List all orders
router.get("/orders/", async (_req, res) => {
  const orders: OrderWithProducts[] = await getAllOrdersWithProducts();
  res.render("orders", { orders });
});

// 2️⃣ Order detail
router.get(
  "/:id",
  async (req, res): Promise<any> => {
    const id = parseInt(req.params.id, 10);
    const order = await getOrderByIdWithProducts(id);
    if (!order) return res.status(404).send("Order not found");
    res.render("order-detail", { order });
  }
);

// 3️⃣ Show “Place Order” form
router.get("/add/new", async (req, res) => {
  // fetch products to choose from
  const products: Product[] = await getAllProducts();
  res.render("add-order", { products });
});

// Handle status change
router.post(
  "/:id/status",
  async (req, res): Promise<any> => {
    const orderId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!status) {
      return res.status(400).send("Status is required");
    }

    try {
      await updateOrderStatus(orderId, status); // Make sure this service function exists
      res.redirect(`/orders/${orderId}`);
    } catch (err) {
      console.error("Error updating status:", err);
      res.status(500).send("Failed to update order status");
    }
  }
);

// 4️⃣ Handle form submission
router.post(
  "/add/new",
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

export default router;
