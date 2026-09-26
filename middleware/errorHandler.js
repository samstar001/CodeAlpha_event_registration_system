// middleware/errorHandler.js — centralized error handler, tuned for Prisma's error codes
import { Prisma } from "@prisma/client"; // needed to check error type below

const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = "Server error";

  // Prisma-specific known errors (invalid input reaching the DB layer)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      // unique constraint violation (e.g. duplicate email, or duplicate userId+eventId pair)
      statusCode = 409;
      message = `Duplicate value for: ${err.meta?.target?.join(", ") || "unique field"}`;
    } else if (err.code === "P2025") {
      // record not found on an update/delete
      statusCode = 404;
      message = "Record not found";
    } else if (err.code === "P2003") {
      // foreign key constraint failed (e.g. userId/eventId that doesn't exist)
      statusCode = 400;
      message = "Invalid reference — related record does not exist";
    }
  }

  // Prisma validation errors (wrong data type/shape sent to a query)
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid input data";
  }

  res.status(statusCode).json({ success: false, message }); // consistent response shape
};

export default errorHandler;
