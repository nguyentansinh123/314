const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const Event = require('../models/event.model');

const createNotification = async ({
    user,
    type,
    title,
    message,
    relatedEvent,
    relatedRegistration,
    metadata
}) => {
    return await Notification.create({
        user,
        type,
        title,
        message,
        relatedEvent,
        relatedRegistration,
        metadata
    });
};

const getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.body.userId }).sort({ createdAt: -1 });
        res.json({ success: true, notifications });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { createNotification, getUserNotifications };