const express = require("express");
const router = express.Router();
const {
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  cancelEvent,
  publishEvent,
  addTicketType,
  updateTicketType,
  deleteTicketType,
  getMyEvents, // Add this new controller function
} = require("../controller/event.controller");
const userAuth = require("../middleware/userAuth");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/multer");
const extractUserId = require("../middleware/extractUserId");

// Admin

// Organizer and admin
router.post(
  "/createEvent",
  extractUserId,
  upload.array("images", 5),
  userAuth,
  authorizeRoles("admin", "organizer"),
  createEvent
);

router.get(
  "/my-events",
  extractUserId,
  userAuth,
  authorizeRoles("admin", "organizer"),
  getMyEvents
);

router.put(
  "/updateEvent/:id",
  extractUserId,
  upload.array("images", 5),
  userAuth,
  authorizeRoles("admin", "organizer"),
  updateEvent
);
router.delete(
  "/deleteEvent/:id",
  userAuth,
  authorizeRoles("admin", "organizer"),
  deleteEvent
);
router.put(
  "/cancelEvent/:id",
  userAuth,
  authorizeRoles("admin", "organizer"),
  cancelEvent
);

router.put(
  "/publishEvent/:id",
  userAuth,
  authorizeRoles("admin", "organizer"),
  publishEvent
);
router.post(
  "/addTicketType/:id",
  userAuth,
  authorizeRoles("admin", "organizer"),
  addTicketType
);
router.put(
  "/updateTicketType/:id/:ticketId",
  userAuth,
  authorizeRoles("admin", "organizer"),
  updateTicketType
);
router.delete(
  "/deleteTicketType/:id/:ticketId",
  userAuth,
  authorizeRoles("admin", "organizer"),
  deleteTicketType
);

// Public routes - no authentication needed
router.get("/public", getAllEvents);

// Authenticated routes
router.get(
  "/",
  userAuth,
  authorizeRoles("user", "admin", "organizer"),
  getAllEvents
);

// Protected routes
router.use(userAuth);
router.use(authorizeRoles("user", "admin", "organizer"));

router.get("/:id", getEvent);

module.exports = router;
