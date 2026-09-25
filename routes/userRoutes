// routes/userRoutes.js — maps HTTP methods + URLs to userController functions
import express from "express";
import {
  createUser,
  getUsers,
  getUserById,
  getUserRegistrations,
} from "../controllers/userController.js";

const router = express.Router();

router.route("/").post(createUser).get(getUsers);

router.route("/:id").get(getUserById);

router.route("/:id/registrations").get(getUserRegistrations); // nested route — a user's registrations, in context of that user

export default router;
