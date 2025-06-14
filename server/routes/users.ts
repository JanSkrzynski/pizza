import { Request, Response, Router } from "express";
import { getAllUsers, addUser, deleteUser, User } from "../services/user";

const router = Router();

// 1) List users
router.get("/", async (_req, res) => {
  const users: User[] = await getAllUsers();
  res.render("users", { users });
});

// 2) Show form
router.get("/add", (_req, res) => {
  res.render("add-user", { error: null });
});

router.post("/add", async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  // quick sanity check
  if (!email || !password || !role) {
    return res.render("add-user", {
      error: "Email, password and role are required.",
    });
  }
  try {
    await addUser(email.trim(), password, role);
    res.redirect("/users");
  } catch (err) {
    console.error("addUser error:", err);
    res.render("add-user", {
      error: "Failed to create user (maybe email already exists).",
    });
  }
});

router.post(
  "/:id/delete",
  async (req: Request, res: Response): Promise<void> => {
    console.log("DELETE /users/:id/delete hit, id =", req.params.id);
    try {
      await deleteUser(req.params.id);
      console.log("Deleted user", req.params.id);
      res.redirect("/users");
    } catch (err) {
      console.error("deleteUser error:", err);
      res.status(500).send("Failed to delete user");
    }
  }
);

export default router;
