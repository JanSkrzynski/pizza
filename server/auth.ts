import { Router, Request, Response } from "express";

import bcrypt from "bcrypt";
import { createUser, getUserByEmail } from "./services/user";

// Extend express-session types to include userId and role
import session from "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: number;
    role?: string;
  }
}

const router = Router();

// Registration form
router.get("/register", (_req, res) => {
  res.render("register", { error: null });
});

// Handle registration
router.post("/register", async (req: Request, res: Response) => {
  const { email, password, confirm } = req.body;
  if (!email || !password || password !== confirm) {
    return res.render("register", {
      error: "Invalid input or passwords don’t match.",
    });
  }
  try {
    await createUser(email.trim(), password);
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.render("register", {
      error: "Registration failed (maybe email exists).",
    });
  }
});

// Login form
router.get("/login", (_req, res) => {
  res.render("login", { error: null });
});

// Handle login
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await getUserByEmail(email.trim());
  if (
    !user ||
    !user.password_hash ||
    !(await bcrypt.compare(password, user.password_hash))
  ) {
    return res.render("login", { error: "Invalid email or password." });
  }
  // Store user ID in session
  (req.session as any).userId = user.id;
  (req.session as any).role = user.role;
  res.redirect("/");
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    res.redirect("/login");
  });
});

export default router;
