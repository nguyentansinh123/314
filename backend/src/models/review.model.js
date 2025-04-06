const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: String,
    comment: String,
    images: [String],
    isVerified: {
        type: Boolean,
        default: false
    },
    response: {
        by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        message: String,
        respondedAt: Date
    }
}, { timestamps: true });

reviewSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);