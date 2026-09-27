//logic for cancelling an existing registration
import prisma from "../config/prisma.js";

// @desc  Cancel a registration (soft cancel — sets status, doesn't delete)
// @route PATCH /api/registrations/:id/cancel
const cancelRegistration = async (req, res, next) => {
  try {
    const registration = await prisma.registration.findUnique({
      where: { id: req.params.id },
    });

    if (!registration) {
      return res
        .status(404)
        .json({ success: false, message: "Registration not found" });
    }

    if (registration.status === "CANCELLED") {
      return res
        .status(409)
        .json({ success: false, message: "Registration is already cancelled" });
    }

    const updated = await prisma.registration.update({
      where: { id: req.params.id },
      data: { status: "CANCELLED" }, // soft cancel — row stays, status flips
    });

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export { cancelRegistration };
