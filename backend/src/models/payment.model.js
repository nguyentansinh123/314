const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    registration: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Registration',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    paymentGateway: {
        type: String,
        required: true,
        enum: ['stripe', 'paypal', 'razorpay', 'other']
    },
    gatewayTransactionId: String,
    paymentMethod: String,
    status: {
        type: String,
        enum: ['initiated', 'processing', 'completed', 'failed', 'refunded'],
        default: 'initiated'
    },
    receiptUrl: String,
    payerEmail: String,
    payerName: String,
    refunds: [{
        amount: Number,
        reason: String,
        processedAt: Date,
        status: String
    }],
    metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);