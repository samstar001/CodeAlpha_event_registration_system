// business logic for User creation and viewing their registrations
import prisma from "../config/prisma.js";

// @desc  Create a new user
// @route POST /api/users
const createUser = async (req, res, next) => {
  try {
    const user = await prisma.user.create({ data: req.body }); // insert a new User row
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err); // forwarded to centralized error handler
  }
};

// @desc  Get all users
// @route GET /api/users
const getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany(); // fetch every User row
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// @desc  Get a single user by ID
// @route GET /api/users/:id
const getUserById = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } }); // lookup by primary key

    // findUnique resolves to null on a missing ID — doesn't throw, so check manually
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc  Get all registrations belonging to a user, each with its event details
// @route GET /api/users/:id/registrations
const getUserRegistrations = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const registrations = await prisma.registration.findMany({
      where: { userId: req.params.id }, // only this user's registrations
      include: { event: true }, // pull in the related Event row for each registration
    });

    res
      .status(200)
      .json({
        success: true,
        count: registrations.length,
        data: registrations,
      });
  } catch (err) {
    next(err);
  }
};

export { createUser, getUsers, getUserById, getUserRegistrations };
