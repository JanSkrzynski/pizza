import express, { Request, Response, Router } from "express";
import path from "path";

const router: Router = express.Router();

router.get("/", (req: Request, res: Response): void => {
  console.log("Request van de homepage of /");
  const name = "Jan";
  const products = ["prod 1", "prod 2", "prod 3"];
  res.render("home", { name, products });
});

export default router;
