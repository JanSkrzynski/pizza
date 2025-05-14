import express, { Request, Response, Router } from "express";
import path from "path";
import { getAllProducts } from "./services/products";

const router: Router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  console.log("Request van de homepage of /");
  const name = "Jan";
  const products = await getAllProducts();
  res.render("home", { name, products });
});

export default router;
