import { Router } from "express";
import usersRouter from "./users";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import ordersRouter from "./orders";
import homeRouter from "./home";

const router: Router = Router();

router.use("/users", usersRouter);
router.use("/products", productsRouter);
router.use("/categories", categoriesRouter);
router.use("/orders", ordersRouter);
router.use("/", homeRouter);

export default router;
