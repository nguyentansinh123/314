const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'organizer', 'admin'],
        default: 'user'
    },
    verifyOTP: {
        type: String,
        default: ''
    },
    verifyOTPExpiredAt: {
        type: Number,
        default: 0
    },
    isAccountVerified: {
        type: Boolean,
        default: false
    },
    resetOTP: {
        type: String,
        default: ""
    },
    resetOTPExpireAt: {
        type: Number,
        default: 0
    },
    profilePicture: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    attendingEvents: [{
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event'
        },
        registration: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Registration'
        },
        ticketType: String, 
        registrationDate: {
            type: Date,
            default: Date.now
        },
        checkInStatus: {
            type: Boolean,
            default: false
        }
    }],
    organizedEvents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],
    savedEvents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],
    notificationPreferences: {
        email: {
            eventReminders: { type: Boolean, default: true },
            newEvents: { type: Boolean, default: true },
            promotions: { type: Boolean, default: true }
        },
        push: {
            eventReminders: { type: Boolean, default: true },
            newEvents: { type: Boolean, default: true }
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);