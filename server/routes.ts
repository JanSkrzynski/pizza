import express, { Request, Response, Router } from "express";
import path from "path";
import {
  addProduct,
  getAllProducts,
  getProductBySlug,
  Product,
} from "./services/products";
import { getAllOrders } from "./services/orders";

const router: Router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const name = "Jan";
  const products: Product[] = await getAllProducts();
  res.render("home", { name, products });
});

// router.post("/", async (req: Request, res: Response) => {
//   const products: Product[] = await getAllProducts();
//   const { name, description, price, image_url, slug, category } = req.body;
//   //toevoegen.
//   // const data = await addProduct();
//   console.log(products[0].name);

//   //pagina renderen of terug keren naat get request van pagina
//   res.redirect(`./detail/${slug}`);
// });

router.get("/product/:slug", async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const product: Product = await getProductBySlug(slug);
  res.render("detail", { product });
});

router.get("/orders", async (req: Request, res: Response) => {
  const orders = await getAllOrders();
  res.render("orders", { orders });
});

export default router;
