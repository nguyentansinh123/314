const express = require("express");
const router = express.Router();
const userAuth = require('../middleware/userAuth');
const { getUserNotifications } = require('../controller/notification.controller');

router.get('/', userAuth, getUserNotifications);

module.exports = router;