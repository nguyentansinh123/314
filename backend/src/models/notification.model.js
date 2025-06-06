const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'registration',
            'review_response'
        ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedEvent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    },
    relatedRegistration: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Registration'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isEmailSent: {
        type: Boolean,
        default: false
    },
    isPushSent: {
        type: Boolean,
        default: false
    },
    metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });


module.exports = mongoose.model('Notification', notificationSchema);