import express from "express";
import path from "path";
import dotenv from "dotenv";
import expressLayouts from "express-ejs-layouts";
import cookieSession from "cookie-session";

import authRouter from "./routes/auth";
import apiRouter from "./routes/api";
import routes from "./routes";
import { requireAuth } from "./middleware/auth";

dotenv.config();

const app = express();

// ─── Static files (css, js, uploads, etc.) ───────────────────────
app.use(express.static(path.join(__dirname, "public")));

// ─── Body parsers for form submissions & JSON ────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ─── EJS + Layouts configuration ────────────────────────────────
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main");

// ─── Cookie-based session (client-side) ──────────────────────────
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET || "please-change-this"],
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  })
);

app.use((req, res, next) => {
  res.locals.userId = req.session.userId;
  res.locals.role = req.session.role;
  next();
});

// ─── Public routes (no login required) ──────────────────────────
app.use("/api", apiRouter);
app.use(authRouter);

// ─── Protect everything below with login ────────────────────────
app.use(requireAuth);
app.use(routes);

// ─── 404 handler ─────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).render("404");
});

// ─── Error handler ───────────────────────────────────────────────
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Uncaught error:", err.stack || err);
    res.status(500).send("Internal Server Error");
  }
);

// ─── Start server ────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
