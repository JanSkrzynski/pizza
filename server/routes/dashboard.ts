import { Router } from "express";
import {
  getTodayOrderCount,
  getTodayPendingOrderCount,
  getThisMonthOrderCount,
  getThisYearRevenue,
} from "../services/orders";

const router = Router();

router.get("/", async (req, res) => {
  const todayCount = await getTodayOrderCount();
  const todayPendingCount = await getTodayPendingOrderCount();
  const monthCount = await getThisMonthOrderCount();
  const yearRevenue = await getThisYearRevenue();

  res.render("dashboard", {
    todayCount,
    todayPendingCount,
    monthCount,
    yearRevenue,
  });
});

export default router;
