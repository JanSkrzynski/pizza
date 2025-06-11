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

// Adding a new product
router.get("/add", (req: Request, res: Response) => {
  res.render("add-product");
});

router.post("/add/product", async (req: Request, res: Response) => {
  const { name, description, price, image_url, slug, category_id } = req.body;
  const categoryNum = parseInt(category_id, 10);
  try {
    await addProduct(name, description, price, image_url, slug, categoryNum);
    res.redirect(`/product/${slug}`);
  } catch (error) {
    res.status(500).send("Failed to add product");
  }
});

router.get("/product/:slug", async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const product: Product = await getProductBySlug(slug);
  res.render("detail", { product });
});

// router.post("/product/add", async (req: Request, res: Response) => {
//   const { name, description, price, image_url, slug, category } = req.body;
//   try {
//     await addProduct(name, description, price, image_url, slug, category);
//     res.redirect(`/product/${slug}`);
//   } catch (error) {
//     res.status(500).send("Failed to add product");
//   }
// });

router.get("/orders", async (req: Request, res: Response) => {
  const orders = await getAllOrders();
  res.render("orders", { orders });
});

export default router;
