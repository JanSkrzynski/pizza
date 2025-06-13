import { Router, Request, Response } from "express";
import {
  getTodayOrderCount,
  getTodayPendingOrderCount, // ← new
  getThisMonthOrderCount,
  getThisYearRevenue,
} from "../services/orders";

const router: Router = Router();

// dashboard
router.get("/", async (_req: Request, res: Response) => {
  try {
    const todayCount = await getTodayOrderCount();
    const todayPendingCount = await getTodayPendingOrderCount(); // ← new
    const monthCount = await getThisMonthOrderCount();
    const yearRevenue = await getThisYearRevenue();

    res.render("index", {
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

export default router;
