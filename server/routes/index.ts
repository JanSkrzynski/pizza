import { Router } from "express";
import dashboardRouter from "./dashboard";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import ordersRouter from "./orders";
import usersRouter from "./users";

const router = Router();

// public/dashboard
router.use("/", dashboardRouter);

// feature prefixes
router.use("/products", productsRouter);
router.use("/categories", categoriesRouter);
router.use("/orders", ordersRouter);
router.use("/users", usersRouter);

export default router;
