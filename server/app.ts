import express, { Application, Request, Response } from "express";
import path from "path";
import router from "./routes";
import expressLayouts from "express-ejs-layouts";

const app: Application = express();
const PORT: number = 3000;

//Template-engine configureren
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//EJS layout configureren
app.use(expressLayouts);
app.set("layout", "layouts/main");

app.use(express.static(path.join(__dirname, "/public")));

app.use("/", router);

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
