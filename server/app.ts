require("dotenv").config();
import { Pool } from "./../node_modules/@types/pg/index.d";
// import { cookieParser } from "cookie-parser";
import express, { Application, Request, Response } from "express";
import path from "path";
import indexRouter from "./routes/index";
import expressLayouts from "express-ejs-layouts";
import rateLimit from "express-rate-limit";
import apiRouter from "./routes/api";
import session from "express-session";
import pgSession from "connect-pg-simple";
import authRouter from "./routes/auth";
import "dotenv/config";
import { requireAuth } from "./middleware/auth";

const app: Application = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Template-engine configureren
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//EJS layout configureren
app.use(expressLayouts);
app.set("layout", "layouts/main");

app.use(express.static(path.join(__dirname, "/public")));

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

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: "Too many requests from this IP, try again later",
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use(limiter);

//Middleware om onze post request in de body te encoderen

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
app.use((req, res, next) => {
  res.locals.userId = req.session.userId;
  res.locals.role = req.session.role;
  res.locals.email = (req.session as any).email; // ← add this
  next();
});

app.use("/api", apiRouter);
app.use("/", authRouter);
app.use(requireAuth);
app.use("/", indexRouter);

app.listen(process.env.PORT, () => {
  console.log(`server is running on http://localhost:${process.env.PORT}`);
});
