import express, { Request, Response, Router } from "express";
import path from "path";
import { getAllProducts, Product } from "./services/products";

const router: Router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  console.log("Request van de homepage of /");
  const name = "Jan";
  const products: Product[] = await getAllProducts();
  res.render("home", { name, products });
});

router.get("/products", async (req: Request, res: Response) => {
  const products: Product[] = await getAllProducts();
  res.render("detail", { products: products[0] });
});

export default router;
