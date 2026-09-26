// controllers/eventController.js — business logic for Event listing, details, and registration submission
import prisma from "../config/prisma.js";

// @desc  Create a new event
// @route POST /api/events
const createEvent = async (req, res, next) => {
  try {
    const event = await prisma.event.create({ data: req.body }); // insert a new Event row
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

// @desc  Get all events, each with a count of confirmed registrations
// @route GET /api/events
const getEvents = async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        _count: {
          select: { registrations: { where: { status: "CONFIRMED" } } }, // only count active registrations
        },
      },
    });

    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (err) {
    next(err);
  }
};

// @desc  Get a single event's details, including confirmed registration count
// @route GET /api/events/:id
const getEventById = async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        _count: {
          select: { registrations: { where: { status: "CONFIRMED" } } },
        },
      },
    });

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

// @desc  Submit a registration for an event, enforcing capacity
// @route POST /api/events/:id/register
const registerForEvent = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const eventId = req.params.id;

    const event = await prisma.event.findUnique({ where: { id: eventId } }); // confirm event exists

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    const confirmedCount = await prisma.registration.count({
      where: { eventId, status: "CONFIRMED" }, // how many confirmed spots are already taken
    });

    if (confirmedCount >= event.capacity) {
      return res.status(409).json({ success: false, message: "Event is full" }); // capacity reached
    }

    const registration = await prisma.registration.create({
      data: { userId, eventId }, // status defaults to CONFIRMED per the schema
    });

    res.status(201).json({ success: true, data: registration });
  } catch (err) {
    next(err); // duplicate (userId, eventId) pair throws P2002, already handled in errorHandler
  }
};

export { createEvent, getEvents, getEventById, registerForEvent };
