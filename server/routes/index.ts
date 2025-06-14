import { Router } from "express";
import dashboardRouter from "./dashboard";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import ordersRouter from "./orders";
import usersRouter from "./users";
import apiRouter from "./api";
import { requireAdmin, requireAuth } from "../middleware/auth";

const router = Router();

// public/dashboard
router.use("/", requireAuth, requireAdmin, dashboardRouter);

// feature prefixes
router.use("/dashboard", dashboardRouter);
router.use("/products", productsRouter);
router.use("/categories", categoriesRouter);
router.use("/orders", ordersRouter);
router.use("/users", usersRouter);

export default router;
