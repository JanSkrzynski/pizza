import { Router } from "express";
import usersRouter from "./users";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import ordersRouter from "./orders";
import homeRouter from "./home";
import apiRouter from "./api";

const router: Router = Router();

router.use("/users", usersRouter);
router.use("/products", productsRouter);
router.use("/categories", categoriesRouter);
router.use("/orders", ordersRouter);
router.use("/", homeRouter);
router.use("/api", apiRouter);

export default router;
