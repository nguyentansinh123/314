const express= require('express')
const router = express.Router();
const {
    register,
    login,
    logOut,
    sendVerifyOtp,
    verifiedEmail,
    isAuthenticated,
    sendResetOtp,
    resetPassword
} = require('../controller/auth.controller');
const userAuth = require('../middleware/userAuth')
const User = require('../models/user.model')

router.post('/register',register )
router.post('/login',login )
router.post('/logout',logOut )
router.post('/send-verify-otp',userAuth,sendVerifyOtp )
router.post('/verify-account',userAuth,verifiedEmail )
router.get('/is-auth',userAuth,isAuthenticated )
router.post('/send-reset-otp',sendResetOtp )
router.post('/reset-password',resetPassword )

// route for testing in since my fucking mongodb crashed and i have to use compass dog crap version

router.get('/test', async (req,res)=>{
    const alluser = await User.find();
    res.json({success: true, alluser})
})

router.delete('/test/:id', async (req,res)=>{
    const alluser = await User.findByIdAndDelete(req.params.id);
    res.json({success: true, alluser})
})

module.exports = router