import { Router } from "express";
import { getAllUsers, addUser, deleteUser } from "../services/user";

const router = Router();

router.get("/", async (_, res) => {
  const users = await getAllUsers();
  res.render("users", { users });
});

router.get("/add", (_, res) => res.render("add-user"));
router.post("/add", async (req, res) => {
  /* … */
});

router.post("/:id/delete", async (req, res) => {
  await deleteUser(req.params.id);
  res.redirect("/users");
});

export default router;
