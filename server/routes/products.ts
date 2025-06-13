import { Category, getAllCategories } from "../services/categories";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  getProductBySlug,
  Product,
  updateProduct,
} from "./../services/products";
import { Request, Response, Router } from "express";
const router: Router = Router();

//Getting products
router.get("/", async (req: Request, res: Response) => {
  const name = "Jan";
  const products: Product[] = await getAllProducts();
  res.render("products", { name, products });
});

// Adding a new product
router.get("/add", async (req: Request, res: Response) => {
  const categories: Category[] = await getAllCategories();
  res.render("add-product", { categories });
});

router.post("/add/product", async (req: Request, res: Response) => {
  const { name, description, price, image_url, slug, category_id } = req.body;
  const priceNum = parseFloat(price);
  const categoryNum = parseInt(category_id, 10);

  try {
    await addProduct(
      name,
      description || null,
      priceNum,
      image_url || null,
      slug,
      categoryNum
    );
    res.redirect(`/product/${slug}`);
  } catch (err) {
    console.error("addProduct error:", err);
    res.status(500).send("Failed to add product: " + (err as Error).message);
  }
});

//Getting one product by slug
router.get("/:slug", async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const product: Product = await getProductBySlug(slug);
  res.render("detail", { product });
});

// Editing a product
router.get("/edit/:slug", async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const product = await getProductBySlug(slug);
  const categories = await getAllCategories();
  res.render("edit-product", { product, categories });
});

router.post(
  "/edit/product",
  async (req: Request, res: Response): Promise<void> => {
    const {
      id,
      name,
      description,
      price,
      image_url,
      slug,
      category_id,
    } = req.body;

    const priceNum = parseFloat(price);
    const categoryNum = parseInt(category_id, 10);
    const idNum = parseInt(id, 10);

    try {
      const updated = await updateProduct(
        idNum,
        name,
        description || null,
        priceNum,
        image_url || null,
        slug,
        categoryNum
      );
      res.redirect(`/product/${updated.slug}`);
    } catch (err) {
      console.error("editProduct error:", err);
      res.status(500).send("Failed to edit product: " + (err as Error).message);
    }
  }
);

//Deleting product
router.post(
  "/delete/product",
  async (req: Request, res: Response): Promise<void> => {
    const idNum = parseInt(req.body.productId, 10);
    if (isNaN(idNum)) {
      res.status(400).send("Invalid product ID");
      return;
    }

    try {
      await deleteProduct(idNum);
      res.redirect("/"); // back to home list
    } catch (err) {
      console.error("deleteProduct error:", err);
      res.status(500).send("Failed to delete product");
    }
  }
);

export default router;
