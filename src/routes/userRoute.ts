import express from "express";
import {
  nweUser,
  getAllUsers,
  getSingleUser,
  deleteUser,
} from "../controllers/userController.js";
import { adminOnly } from "../middlewares/auth.js";

const app = express.Router();

app.post("/new", nweUser);
app.get("/all", adminOnly, getAllUsers);
app.route("/:id").get(getSingleUser).delete(adminOnly, deleteUser);

export default app;
