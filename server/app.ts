require("dotenv").config();
import { Pool } from "./../node_modules/@types/pg/index.d";
// import { cookieParser } from "cookie-parser";
import express, { Application, Request, Response } from "express";
import path from "path";
import router from "./routes";
import expressLayouts from "express-ejs-layouts";
import rateLimit from "express-rate-limit";
import apiRouter from "./apiRouter";
import session from "express-session";
import pgSession from "connect-pg-simple";
import authRouter from "./auth";
import "dotenv/config";

const app: Application = express();
const PORT: number = 3000;

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: "Too many requests from this IP, try again later",
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use(limiter);

//Middleware om onze post request in de body te encoderen
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Template-engine configureren
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//EJS layout configureren
app.use(expressLayouts);
app.set("layout", "layouts/main");

app.use(express.static(path.join(__dirname, "/public")));

console.log("Database URL:", process.env.DATABASE_URL);
console.log("Session Secret:", process.env.SESSION_SECRET);
console.log("cwd:", process.cwd());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// // Create a plain pg.Pool for sessions
// const pgPool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   // or host/user/password/database if you’re not using a URL
// });

// // Configure and mount express-session with connect-pg-simple
// const PgSession = pgSession(session);
// app.use(
//   session({
//     store: new PgSession({
//       pool: pgPool, // ← your pg.Pool instance here
//       tableName: "user_sessions", // defaults to 'session', change as you like
//       createTableIfMissing: true, // auto-create table if not exists
//     }),
//     secret: process.env.SESSION_SECRET || "keyboard cat",
//     resave: false,
//     saveUninitialized: false,
//     cookie: { maxAge: 86400000 }, // 1 day
//   })
// );

app.use("/", router);
app.use("/api", apiRouter);
app.use(authRouter);

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});

// app.use(cookieParser());
// app.use(express.urlencoded({ extended: true }));

// app.use(
//   session({
//     secret: "your-secret-key",
//     resave: false,
//     saveUninitialized: true,
//   })
// );

// app.use(csrf({ cookie: true }));
// app.use((req: Request, res: Response, next: Function) => {
//   res.locals.csrfToken = req.csrfToken();
//   next();
// });
