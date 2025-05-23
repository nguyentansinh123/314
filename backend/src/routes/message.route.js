const express = require('express');
const router = express.Router();
const { getUsersForSidebar, getMessages, sendMessage } = require('../controller/message.controller');
const userAuth = require('../middleware/userAuth');

router.get('/users', userAuth, getUsersForSidebar);

router.get('/:id', userAuth, getMessages);

router.post('/send/:id', userAuth, sendMessage);

module.exports = router;