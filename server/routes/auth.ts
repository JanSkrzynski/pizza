import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { createUser, getUserByEmail } from "../services/user";

// Extend Express Request interface to include session properties
declare global {
  namespace Express {
    interface Request {
      session: {
        userId?: string;
        role?: string;
        destroy(callback: (err: any) => void): void;
      };
    }
  }
}

const router = Router();

// ─── Registration Form ─────────────────────────────────────────────
router.get("/register", (_req, res) => {
  res.render("register", { error: null });
});

// ─── Handle Registration ────────────────────────────────────────────
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
    console.error("Registration error:", err);
    res.render("register", {
      error: "Registration failed (email may already be in use).",
    });
  }
});

// ─── Login Form ────────────────────────────────────────────────────
router.get("/login", (_req, res) => {
  res.render("login", { error: null });
});

// ─── Handle Login ───────────────────────────────────────────────────
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render("login", { error: "Email and password required." });
  }

  try {
    const user = await getUserByEmail(email.trim());
    if (
      !user ||
      !user.password_hash ||
      !(await bcrypt.compare(password, user.password_hash))
    ) {
      return res.render("login", { error: "Invalid email or password." });
    }

    // Save to session
    req.session.userId = user.id;
    req.session.role = user.role;
    res.redirect("/");
  } catch (err) {
    console.error("Login error:", err);
    res.render("login", { error: "An error occurred—please try again." });
  }
});

// ─── Logout ────────────────────────────────────────────────────────
router.post("/logout", (_req, res) => {
  // clearing req.session wipes the cookie
  (_req.session as any) = null;
  res.redirect("/login");
});

export default router;
