const express = require('express');
const router = express.Router();
const { registerForEvent, unattendEvent, getEventAttendees, adminForceUnattend, confirmPayment, getEventAttendeesForOrganizer } = require('../controller/registration.controller');
const userAuth = require('../middleware/userAuth');
const authorizeRoles = require('../middleware/roleMiddleware');



// admin and organizer

router.get(
    '/attendees/:eventId',
    userAuth,
    authorizeRoles('admin'),
    getEventAttendees
);

router.delete(
    '/force-unattend/:registrationId',
    userAuth,
    authorizeRoles('admin'),
    adminForceUnattend
);

// organizer and admin
router.get(
    '/my-event-attendees/:eventId',
    userAuth,
    authorizeRoles('organizer', 'admin'),
    getEventAttendeesForOrganizer
);

// all user

router.post(
    '/register',
    userAuth,
    authorizeRoles('user', 'organizer', 'admin'),
    registerForEvent
);

router.delete(
    '/unattend/:registrationId',
    userAuth,
    authorizeRoles('user', 'organizer', 'admin'),
    unattendEvent
);

router.post(
    '/confirm-payment',
    userAuth,
    authorizeRoles('user', 'organizer', 'admin'),
    confirmPayment
);


module.exports = router;