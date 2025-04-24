const Review = require('../models/review.model');
const { createNotification } = require('./notification.controller');

const createOrUpdateReview = async (req, res) => {
    try {
        const { event, rating, title, comment } = req.body;
        const user = req.body.userId;

        let review = await Review.findOne({ event, user });

        if (review) {
            review.rating = rating;
            review.title = title;
            review.comment = comment;
            await review.save();
            return res.json({ success: true, message: 'Review updated', review });
        } else {
            review = await Review.create({ event, user, rating, title, comment });
            return res.status(201).json({ success: true, message: 'Review created', review });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
};

const getEventReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ event: req.params.eventId }).populate('user', 'name email');
        res.json({ success: true, reviews });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
};

const respondToReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);
        if (!review) {
            return res.status(404).json({ success: false, error: 'Review not found' });
        }
        review.response = {
            by: req.body.userId,
            message: req.body.message,
            respondedAt: new Date()
        };
        await review.save();

        await createNotification({
            user: review.user,
            type: 'review_response',
            title: 'Your review received a response',
            message: `Your review for event "${review.event}" received a response: "${req.body.message}"`,
            relatedEvent: review.event
        });

        res.json({ success: true, message: 'Response added', review });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
};

const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);
        if (!review) {
            return res.status(404).json({ success: false, error: 'Review not found' });
        }
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }
        await review.deleteOne();
        res.json({ success: true, message: 'Review deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
};

module.exports = {
    createOrUpdateReview,
    getEventReviews,
    respondToReview,
    deleteReview
};