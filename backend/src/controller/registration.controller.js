const Registration = require('../models/registration.model');
const Event = require('../models/event.model');
const User = require('../models/user.model');
const { createNotification } = require('./notification.controller');

const registerForEvent = async (req, res) => {
    try {
        const { eventId, ticketTypeId, quantity, paymentMethod } = req.body;
        const userId = req.body.userId;

        // Check if the user is already registered for this event
        const existingRegistration = await Registration.findOne({
            event: eventId,
            user: userId
        });
        
        if (existingRegistration) {
            return res.status(400).json({ 
                success: false, 
                error: 'You are already registered for this event' 
            });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        const ticketType = event.ticketTypes.id(ticketTypeId);
        if (!ticketType) {
            return res.status(404).json({ success: false, error: 'Ticket type not found' });
        }

        if (ticketType.quantity - ticketType.sold < quantity) {
            return res.status(400).json({ success: false, error: 'Not enough tickets available' });
        }

        const totalAmount = ticketType.price * quantity;

        const ticketNumber = `TICKET-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        const registration = await Registration.create({
            event: eventId,
            user: userId,
            ticketType: ticketTypeId,
            ticketTypeName: ticketType.name,
            quantity,
            totalAmount,
            paymentStatus: 'pending',
            paymentMethod,
            ticketNumber,
            isVIP: ticketType.isVIP || false
        });

        ticketType.sold += quantity;
        await event.save();

        await createNotification({
            user: userId,
            type: 'registration',
            title: 'Event Registration Successful',
            message: `You have registered for the event "${event.title}".`,
            relatedEvent: eventId,
            relatedRegistration: registration._id
        });

        await createNotification({
            user: event.organizer,
            type: 'registration',
            title: 'New Event Registration',
            message: `A user has registered for your event "${event.title}".`,
            relatedEvent: eventId,
            relatedRegistration: registration._id
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            registration
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message || 'Server Error'
        });
    }
};

const unattendEvent = async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.registrationId);
        if (!registration) {
            return res.status(404).json({ success: false, error: 'Registration not found' });
        }

        if (registration.user.toString() !== req.body.userId) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        await registration.deleteOne();

        res.json({ success: true, message: 'Successfully unattended event' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
};

const getEventAttendees = async (req, res) => {
    try {
        const registrations = await Registration.find({ event: req.params.eventId })
            .populate('user', 'name email'); 

        res.json({
            success: true,
            attendees: registrations.map(reg => ({
                user: reg.user,
                ticketType: reg.ticketTypeName,
                quantity: reg.quantity,
                registrationId: reg._id
            }))
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
};

const adminForceUnattend = async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.registrationId);
        if (!registration) {
            return res.status(404).json({ success: false, error: 'Registration not found' });
        }

        await registration.deleteOne();

        res.json({ success: true, message: 'User has been forced to unattend the event' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
};

const confirmPayment = async (req, res) => {
    try {
        const { registrationId, paymentDetails } = req.body;
        
        const registration = await Registration.findById(registrationId);
        
        if (!registration) {
            return res.status(404).json({ success: false, error: 'Registration not found' });
        }
        
        // Update registration with payment info
        registration.paymentStatus = 'completed';
        registration.paymentDetails = {
            transactionId: paymentDetails.transactionId,
            paymentMethod: paymentDetails.paymentMethod,
            amount: paymentDetails.amount,
            paidAt: new Date()
        };
        
        await registration.save();
        
        // Update event ticket sales
        await Event.findOneAndUpdate(
            { _id: registration.event, 'ticketTypes._id': registration.ticketType },
            { $inc: { 'ticketTypes.$.sold': registration.quantity } }
        );
        
        return res.status(200).json({
            success: true,
            message: 'Payment confirmed successfully',
            registration
        });
    } catch (error) {
        console.error('Error confirming payment:', error);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
};

const getEventAttendeesForOrganizer = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const userId = req.body.userId;
        const userRole = req.body.role;

        // First check if the event exists
        const event = await Event.findById(eventId);
        
        if (!event) {
            return res.status(404).json({ 
                success: false, 
                error: 'Event not found' 
            });
        }

        // If user is an organizer, verify they are the event creator
        if (userRole === 'organizer' && event.organizer.toString() !== userId) {
            return res.status(403).json({ 
                success: false, 
                error: 'You are not authorized to view attendees for this event' 
            });
        }

        // Admin can view any event's attendees, organizer can only view their own events

        // Get all registrations for this event
        const registrations = await Registration.find({ event: eventId })
            .populate('user', 'name email profilePicture')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: registrations.length,
            attendees: registrations.map(reg => ({
                registrationId: reg._id,
                user: reg.user,
                ticketType: reg.ticketTypeName,
                quantity: reg.quantity,
                paymentStatus: reg.paymentStatus,
                registeredAt: reg.createdAt,
                isVIP: reg.isVIP,
                ticketNumber: reg.ticketNumber
            }))
        });
    } catch (err) {
        console.error('Error getting event attendees:', err);
        res.status(500).json({ 
            success: false, 
            error: err.message || 'Server Error' 
        });
    }
};

const getMyTickets = async (req, res) => {
    try {
        const userId = req.body.userId;
        
        // Find all registrations for this user
        const registrations = await Registration.find({ user: userId })
            .populate({
                path: 'event',
                select: 'title startDate endDate location images'
            })
            .sort({ createdAt: -1 });
            
        // Format the data for the frontend
        const formattedRegistrations = registrations.map(reg => {
            const event = reg.event;
            const featuredImage = event.images.find(img => img.isFeatured)?.url || '';
            
            return {
                registrationId: reg._id,
                event: {
                    _id: event._id,
                    title: event.title,
                    startDate: event.startDate,
                    endDate: event.endDate,
                    venue: event.location.venue,
                    city: event.location.address.city,
                    featuredImage: featuredImage
                },
                ticketType: reg.ticketTypeName,
                quantity: reg.quantity,
                paymentStatus: reg.paymentStatus,
                registeredAt: reg.createdAt,
                isVIP: reg.isVIP,
                ticketNumber: reg.ticketNumber
            };
        });
        
        res.json({
            success: true,
            count: registrations.length,
            registrations: formattedRegistrations
        });
        
    } catch (err) {
        console.error('Error getting user tickets:', err);
        res.status(500).json({ 
            success: false, 
            error: err.message || 'Server Error' 
        });
    }
};

module.exports = { 
    registerForEvent, 
    unattendEvent, 
    getEventAttendees, 
    adminForceUnattend, 
    confirmPayment,
    getEventAttendeesForOrganizer,
    getMyTickets
};