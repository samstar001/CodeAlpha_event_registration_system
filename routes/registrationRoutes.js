// maps HTTP methods + URLs to registrationController functions
import express from "express";
import { cancelRegistration } from "../controllers/registrationController.js";

const router = express.Router();

router.route("/:id/cancel").patch(cancelRegistration); // PATCH — this is a status change

export default router;
