// routes/eventRoutes.js — maps HTTP methods + URLs to eventController functions
import express from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  registerForEvent,
} from "../controllers/eventController.js";

const router = express.Router();

router.route("/").post(createEvent).get(getEvents);

router.route("/:id").get(getEventById);

router.route("/:id/register").post(registerForEvent); // nested route — registering is an action performed on a specific event

export default router;
