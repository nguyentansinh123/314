const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Event description is required']
    },
    category: {
        type: String,
        enum: ['conference', 'music_concert', 'networking', 'workshop', 'exhibition', 'sports', 'other'],
        required: [true, 'Event category is required']
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
        validate: {
            validator: function(value) {
                return value > new Date();
            },
            message: 'Start date must be in the future'
        }
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required'],
        validate: {
            validator: function(value) {
                return value > this.startDate;
            },
            message: 'End date must be after start date'
        }
    },
    location: {
        venue: {
            type: String,
            required: [true, 'Venue name is required']
        },
        address: {
            street: String,
            city: {
                type: String,
                required: [true, 'City is required']
            },
            state: String,
            zipCode: String,
            country: {
                type: String,
                required: [true, 'Country is required']
            }
        }
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Organizer is required'],
        validate: {
            validator: async function(value) {
                const user = await mongoose.model('User').findById(value);
                return user && (user.role === 'organizer' || user.role === 'admin');
            },
            message: 'Organizer must be a user with organizer role'
        }
    },
    ticketTypes: [{
        name: {
            type: String,
            required: [true, 'Ticket type name is required']
        },
        description: String,
        price: {
            type: Number,
            required: [true, 'Ticket price is required'],
            min: [0, 'Price cannot be negative']
        },
        quantity: {
            type: Number,
            required: [true, 'Ticket quantity is required'],
            min: [0, 'Quantity cannot be negative']
        },
        sold: {
            type: Number,
            default: 0
        },
        benefits: [String],
        isActive: {
            type: Boolean,
            default: true
        },
        isVIP: {
            type: Boolean,
            default: false
        }
    }],
    images: [{
        url: String,
        isFeatured: {
            type: Boolean,
            default: false
        }
    }],
    tags: [String],
    status: {
        type: String,
        enum: ['draft', 'published', 'cancelled', 'completed'],
        default: 'draft'
    },
    cancellationReason: String,
    refundPolicy: {
        type: String,
        enum: ['no_refunds', 'full_refund_before_event', 'partial_refund_before_event'],
        default: 'no_refunds'
    },
    views: {
        type: Number,
        default: 0
    },
    registrationCount: {
        type: Number,
        default: 0
    },
    socialLinks: {
        facebookEvent: String,
        twitterHashtag: String,
        instagramHandle: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});


module.exports = mongoose.model('Event', eventSchema);