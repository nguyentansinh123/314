const Event = require('../models/event.model')
const cloudinary = require('../config/cloudinary');


const createEvent = async (req, res) => {
    try {
        let {
            title,
            description,
            category,
            startDate,
            endDate,
            location,
            ticketTypes,
            tags,
            status,
            refundPolicy,
            socialLinks
        } = req.body;

        console.log("Request body:", req.body);
        

        if (typeof location === 'string') location = JSON.parse(location);
        if (typeof ticketTypes === 'string') ticketTypes = JSON.parse(ticketTypes);
        if (typeof tags === 'string') tags = JSON.parse(tags);
        if (typeof socialLinks === 'string') socialLinks = JSON.parse(socialLinks);

        if (!title || !description || !category || !startDate || !endDate || !location) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: title, description, category, dates, or location'
            });
        }
        if (!location.venue || !location.address || !location.address.city || !location.address.country) {
            return res.status(400).json({
                success: false,
                error: 'Location must include venue, city, and country'
            });
        }
        if (ticketTypes && ticketTypes.length > 0) {
            for (const ticket of ticketTypes) {
                if (!ticket.name || ticket.price === undefined || ticket.quantity === undefined) {
                    return res.status(400).json({
                        success: false,
                        error: 'Each ticket type must include name, price, and quantity'
                    });
                }
                if (ticket.price < 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'Ticket price cannot be negative'
                    });
                }
                if (ticket.quantity < 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'Ticket quantity cannot be negative'
                    });
                }
            }
        }
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start <= now) {
            return res.status(400).json({
                success: false,
                error: 'Start date must be in the future'
            });
        }
        if (end <= start) {
            return res.status(400).json({
                success: false,
                error: 'End date must be after start date'
            });
        }
        if (status && !['draft', 'published', 'cancelled', 'completed'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status value'
            });
        }
        if (refundPolicy && !['no_refunds', 'full_refund_before_event', 'partial_refund_before_event'].includes(refundPolicy)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid refund policy value'
            });
        }

        let images = [];
        if (req.files && req.files.length > 0) {
            for (const [i, file] of req.files.entries()) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "event_images"
                });
                images.push({
                    url: result.secure_url,
                    isFeatured: i === 0 
                });
            }
        }

        const eventData = {
            title,
            description,
            category,
            startDate: start,
            endDate: end,
            location,
            organizer: req.body.userId,
            status: status || 'draft',
            refundPolicy: refundPolicy || 'no_refunds',
            ...(ticketTypes && { ticketTypes }),
            ...(tags && { tags }),
            ...(socialLinks && { socialLinks }),
            images
        };

        const event = await Event.create(eventData);

        res.status(201).json({
            success: true,
            data: event
        });

    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                error: messages
            });
        }
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Duplicate field value entered'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error: ' + err.message
        });
    }
};

const getAllEvents = async (req, res) => {
    try {
        const { status, category, organizer, upcoming } = req.query;
        
        let query = {};
        
        if (status) query.status = status;
        if (category) query.category = category;
        if (organizer) query.organizer = organizer;
        
        if (upcoming === 'true') {
            query.startDate = { $gt: new Date() };
        }
        
        const events = await Event.find(query)
            .populate('organizer', 'name email')
            .sort({ startDate: 1 });
            
        res.json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error: ' + err.message
        });
    }
};

const getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'name email');
            
        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        
        event.views += 1;
        await event.save();
        
        res.json({
            success: true,
            data: event
        });
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error: ' + err.message
        });
    }
};

const updateEvent = async (req, res) => {
    try {
        console.log("Update event called for ID:", req.params.id);
        
        let event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }

        if (event.organizer.toString() !== req.body.userId && 
            (!req.user || (req.user.role !== 'admin' && event.organizer.toString() !== req.user.id))) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to update this event'
            });
        }

        if (typeof req.body.location === 'string') {
            req.body.location = JSON.parse(req.body.location);
        }
        
        if (typeof req.body.ticketTypes === 'string') {
            req.body.ticketTypes = JSON.parse(req.body.ticketTypes);
        }
        
        if (typeof req.body.tags === 'string') {
            req.body.tags = JSON.parse(req.body.tags);
        }
        
        if (typeof req.body.socialLinks === 'string') {
            req.body.socialLinks = JSON.parse(req.body.socialLinks);
        }

        if (req.body.imagesToDelete) {
            try {
                const imagesToDelete = JSON.parse(req.body.imagesToDelete);
                if (Array.isArray(imagesToDelete) && imagesToDelete.length > 0) {
                    event.images = event.images.filter(img => 
                        !imagesToDelete.includes(img._id.toString())
                    );
                    console.log("Images after deletion:", event.images);
                }
            } catch (err) {
                console.error("Error parsing imagesToDelete:", err);
            }
        }

        if (req.files && req.files.length > 0) {
            console.log("Uploading new images:", req.files.length);
            const newImages = [];
            
            for (const file of req.files) {
                try {
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: "event_images"
                    });
                    
                    newImages.push({
                        url: result.secure_url,
                        isFeatured: event.images.length === 0 && newImages.length === 0
                    });
                } catch (err) {
                    console.error("Error uploading image to Cloudinary:", err);
                }
            }
            
            event.images = [...event.images, ...newImages];
            console.log("Images after adding new ones:", event.images);
        }

        if (req.body.title) event.title = req.body.title;
        if (req.body.description) event.description = req.body.description;
        if (req.body.category) event.category = req.body.category;
        if (req.body.status && (event.status !== 'published' || req.body.status === 'published')) {
            event.status = req.body.status;
        }
        if (req.body.refundPolicy) event.refundPolicy = req.body.refundPolicy;
        if (req.body.ticketTypes) event.ticketTypes = req.body.ticketTypes;
        if (req.body.tags) event.tags = req.body.tags;
        if (req.body.socialLinks) event.socialLinks = req.body.socialLinks;
        
        if (event.status !== 'published') {
            if (req.body.startDate) event.startDate = new Date(req.body.startDate);
            if (req.body.endDate) event.endDate = new Date(req.body.endDate);
            if (req.body.location) event.location = req.body.location;
        }

        await event.save();
        console.log("Event updated successfully:", event._id);

        res.json({
            success: true,
            data: event
        });
    } catch (err) {
        console.error("Error updating event:", err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                error: messages
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error: ' + err.message
        });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        
        if (event.organizer.toString() !== req.body.userId) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to delete this event'
            });
        }
        
        const hasTicketsSold = event.ticketTypes.some(ticket => ticket.sold > 0);
        
        if (hasTicketsSold) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete event with tickets sold. Cancel instead.'
            });
        }

        await event.deleteOne();
        
        res.json({
            success: true,
            data: {}
        });
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error: ' + err.message
        });
    }
};

const cancelEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        
        if (event.organizer.toString() !== req.body.userId) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to cancel this event'
            });
        }
        
        if (event.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                error: 'Event is already cancelled'
            });
        }
        
        if (event.status === 'completed') {
            return res.status(400).json({
                success: false,
                error: 'Cannot cancel a completed event'
            });
        }
        
        if (!req.body.cancellationReason) {
            return res.status(400).json({
                success: false,
                error: 'Cancellation reason is required'
            });
        }
        
        event.status = 'cancelled';
        event.cancellationReason = req.body.cancellationReason;
        await event.save();
        
        res.json({
            success: true,
            data: event
        });
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error: ' + err.message
        });
    }
};

const publishEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        
        if (event.organizer.toString() !== req.body.userId) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to publish this event'
            });
        }
        
        if (event.status === 'published') {
            return res.status(400).json({
                success: false,
                error: 'Event is already published'
            });
        }
        
        if (event.ticketTypes.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Event must have at least one ticket type to be published'
            });
        }
        
        event.status = 'published';
        await event.save();
        
        res.json({
            success: true,
            data: event
        });
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error: ' + err.message
        });
    }
};

const addTicketType = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        
        if (event.organizer.toString() !== req.body.userId) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to add tickets to this event'
            });
        }
        
        if (event.status === 'published') {
            return res.status(400).json({
                success: false,
                error: 'Cannot add tickets to a published event'
            });
        }
        
        const { name, price, quantity } = req.body;
        if (!name || price === undefined || quantity === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Name, price and quantity are required for ticket type'
            });
        }
        
        const duplicateName = event.ticketTypes.some(
            ticket => ticket.name.toLowerCase() === name.toLowerCase()
        );
        
        if (duplicateName) {
            return res.status(400).json({
                success: false,
                error: 'Ticket type with this name already exists'
            });
        }
        
        event.ticketTypes.push(req.body);
        await event.save();
        
        res.status(201).json({
            success: true,
            data: event.ticketTypes[event.ticketTypes.length - 1]
        });
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                error: messages
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error: ' + err.message
        });
    }
};

const updateTicketType = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        
        if (event.organizer.toString() !== req.body.userId) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to update tickets for this event'
            });
        }
        
        const ticketIndex = event.ticketTypes.findIndex(
            ticket => ticket._id.toString() === req.params.ticketId
        );
        
        if (ticketIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Ticket type not found'
            });
        }
        
        if (event.status === 'published') {
            const restrictedFields = ['name', 'price'];
            for (const field of restrictedFields) {
                if (req.body[field] !== undefined && 
                    req.body[field] !== event.ticketTypes[ticketIndex][field]) {
                    return res.status(400).json({
                        success: false,
                        error: `Cannot update ${field} for a published event`
                    });
                }
            }
        }
        
        if (req.body.quantity !== undefined && 
            req.body.quantity < event.ticketTypes[ticketIndex].sold) {
            return res.status(400).json({
                success: false,
                error: `Cannot set quantity below ${event.ticketTypes[ticketIndex].sold} (already sold)`
            });
        }
        
        Object.assign(event.ticketTypes[ticketIndex], req.body);
        await event.save();
        
        res.json({
            success: true,
            data: event.ticketTypes[ticketTypesIndex]
        });
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                error: 'Event or ticket type not found'
            });
        }
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                error: messages
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error: ' + err.message
        });
    }
};

const deleteTicketType = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        
        if (event.organizer.toString() !== req.body.userId) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to delete tickets from this event'
            });
        }
        
        const ticketIndex = event.ticketTypes.findIndex(
            ticket => ticket._id.toString() === req.params.ticketId
        );
        
        if (ticketIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Ticket type not found'
            });
        }
        
        if (event.ticketTypes[ticketIndex].sold > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete ticket type with tickets sold'
            });
        }
        
        event.ticketTypes.splice(ticketIndex, 1);
        await event.save();
        
        res.json({
            success: true,
            data: {}
        });
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                error: 'Event or ticket type not found'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error: ' + err.message
        });
    }
};

module.exports = {
    getAllEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    cancelEvent,
    publishEvent,
    addTicketType,
    updateTicketType,
    deleteTicketType
};