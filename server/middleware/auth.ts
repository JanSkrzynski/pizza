import { RequestHandler } from "express";

export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect("/login");
    return;
  }

  next();
};

export const requireAdmin: RequestHandler = (req, res, next) => {
  if (req.session.role !== "admin") {
    res.status(403).send("Forbidden");
    return;
  }
  next();
};
