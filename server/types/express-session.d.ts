import "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    role?: string;
    email?: string; // ← add this line
  }
}
