const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
    platformName: {
        type: String,
        default: 'EventHub'
    },
    commissionRate: {
        type: Number,
        default: 10 // percentage
    },
    paymentGateways: {
        stripe: {
            enabled: Boolean,
            publishableKey: String,
            secretKey: String
        },
        paypal: {
            enabled: Boolean,
            clientId: String,
            secret: String
        }
    },
    emailSettings: {
        fromEmail: String,
        smtpConfig: mongoose.Schema.Types.Mixed
    },
    notificationDefaults: {
        eventReminderDays: {
            type: Number,
            default: 1
        },
        autoRefundCancelledEvents: {
            type: Boolean,
            default: true
        }
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);