// server.js — entry point: loads env, connects DB, wires middleware/routes, starts the server
import express from "express";
import dotenv from "dotenv";
import errorHandler from "./middleware/errorHandler.js";
import eventRoutes from "./routes/eventRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";

dotenv.config(); // load .env into process.env before anything else runs

const app = express();

app.use(express.json()); // parse incoming JSON request bodies

app.use("/api/events", eventRoutes); // event listing, details, registration submission
app.use("/api/users", userRoutes); // user creation, view a user's registrations
app.use("/api/registrations", registrationRoutes); // cancel a registration

app.get("/", (req, res) => {
  res.send("Event Registration API is running"); // simple health check
});

app.use(errorHandler); // registered last — catches next(err) from any route above

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
