const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
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
    ticketType: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    ticketTypeName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'paypal', 'bank_transfer', 'crypto', 'other'],
        required: true
    },
    transactionId: String,
    ticketNumber: {
        type: String,
        unique: true
    },
    checkInTime: Date,
    isVIP: {
        type: Boolean,
        default: false
    },
    refundRequest: {
        requested: Boolean,
        reason: String,
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected']
        },
        processedAt: Date,
        amountRefunded: Number
    }
}, { timestamps: true });


module.exports = mongoose.model('Registration', registrationSchema);