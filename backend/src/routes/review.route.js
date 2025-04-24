const express = require('express');
const router = express.Router();
const { createOrUpdateReview, getEventReviews, respondToReview ,deleteReview} = require('../controller/review.controller');
const userAuth = require('../middleware/userAuth');
const authorizeRoles = require('../middleware/roleMiddleware');

router.post(
    '/',
    userAuth,
    authorizeRoles('user', 'organizer', 'admin'),
    createOrUpdateReview
);

router.get(
    '/event/:eventId',
    userAuth,
    getEventReviews
);

router.post(
    '/respond/:reviewId',
    userAuth,
    authorizeRoles('organizer', 'admin'),
    respondToReview
);

router.delete(
    '/:reviewId',
    userAuth,
    authorizeRoles('user', 'organizer', 'admin'),
    deleteReview
);

module.exports = router;