const express= require('express')
const router = express.Router();
const {
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
} = require('../controller/event.controller')
const userAuth = require('../middleware/userAuth');
const authorizeRoles = require('../middleware/roleMiddleware');

// Admin 

// Organizer and admin
router.post('/createEvent',userAuth,authorizeRoles('admin','organizer'), createEvent)
router.put('/updateEvent',userAuth,authorizeRoles('admin','organizer'), updateEvent)
router.delete('/deleteEvent',userAuth,authorizeRoles('admin','organizer'), deleteEvent)
router.put('/cancelEvent',userAuth,authorizeRoles('admin','organizer'), cancelEvent)
router.put('/publishEvent',userAuth,authorizeRoles('admin','organizer'), publishEvent)
router.post('/addTicketType',userAuth,authorizeRoles('admin','organizer'), addTicketType)
router.put('/updateTicketType',userAuth,authorizeRoles('admin','organizer'), updateTicketType)
router.delete('/deleteTicketType',userAuth,authorizeRoles('admin','organizer'), deleteTicketType)

// All user
router.get('/',userAuth,authorizeRoles('user','admin','organizer'), getAllEvents) 
router.get('/:id',userAuth,authorizeRoles('user','admin','organizer'), getEvent) 


module.exports = router