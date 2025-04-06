const express= require('express')
const router = express.Router();
const {getAllUser, editUser, deleteUser, updateProfile} = require('../controller/user.controller')
const userAuth = require('../middleware/userAuth');
const authorizeRoles = require('../middleware/roleMiddleware');
// Admin

router.get('/admin/getAllUser', userAuth,authorizeRoles('admin') ,getAllUser)
router.put('/admin/editUser', userAuth,authorizeRoles('admin'),editUser)
router.delete('/admin/deleteUser', userAuth,authorizeRoles('admin'),deleteUser)


// Organizer and Admin


// everyone

router.put("/update-profile",userAuth,authorizeRoles('user','admin','organizer'),updateProfile)

module.exports = router