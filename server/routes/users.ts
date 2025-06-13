import { Router, Request, Response } from "express";
import { addUser, getAllUsers, User } from "../services/user";
const router: Router = Router();

// List all users
router.get("/", async (_req, res) => {
  const users: User[] = await getAllUsers();
  res.render("users", { users });
});

// Show add-user form
router.get("/add", (_req, res) => {
  res.render("add-user");
});

// Handle new user submission
// Handle new user submission, now with password
router.post(
  "/add",
  async (req: Request, res: Response): Promise<any> => {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).send("Email, password and role are required");
    }

    try {
      await addUser(email.trim(), password, role.trim());
      res.redirect("/users");
    } catch (err) {
      console.error("addUser error:", err);
      res.status(500).send("Failed to create user");
    }
  }
);

export default router;
