const express = require('express');
const router = express.Router();
const { registerForEvent, unattendEvent , getEventAttendees,adminForceUnattend } = require('../controller/registration.controller');
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


module.exports = router;