import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) return res.redirect("/login");
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session.role !== "admin") return res.status(403).send("Forbidden");
  next();
}
