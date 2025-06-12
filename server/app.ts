import express, { Application, Request, Response } from "express";
import path from "path";
import router from "./routes";
import expressLayouts from "express-ejs-layouts";
import rateLimit from "express-rate-limit";
import apiRouter from "./api";

const app: Application = express();
const PORT: number = 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

//Middleware om onze post request in de body te encoderen
app.use(express.urlencoded({ extended: true }));

//Template-engine configureren
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//EJS layout configureren
app.use(expressLayouts);
app.set("layout", "layouts/main");

app.use(express.static(path.join(__dirname, "/public")));

app.use("/", router);
app.use("/api", apiRouter);

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
