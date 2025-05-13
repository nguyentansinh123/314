const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')
const transporter = require('../config/nodemailer')
const bcrypt = require('bcryptjs')
const mjml2html = require('mjml')
const welcomeEmailTemplate = require('../../templates/WelcomeEmail')
const OtpCodeEmail = require('../../templates/OtpCodeEmail')

const register = async (req,res) =>{
    const {name, email, password} = req.body

    if(!name || !email || !password){
        return res.json({success: false, message:"Missing details"})
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const existingUser = await userModel.findOne({email})

        if(existingUser){
            return res.json({success: false, message:"Email already exists"})
        }

        const user = new userModel({name, email, password: hashedPassword}) 
        await user.save()

        const token = jwt.sign({id: user._id,role: user.role}, process.env.JWT_SECRET, {expiresIn: '7d'})
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV=== 'production' ? 'none' : 'strict',
            maxAge: 7* 24 * 60 * 60 *1000
        })

        try {
            const { html } = mjml2html(welcomeEmailTemplate(name));

            const mailOptions = {
                from: process.env.SENDER_EMAIL,
                to: email,
                subject: "Welcome to our platform",
                html: html,
            };

            await transporter.sendMail(mailOptions);
            console.log('Welcome email sent successfully');
        } catch (emailError) {
            console.error('Error sending welcome email:', emailError);
        }

        return res.json({success: true,message: "User registered successfully"})

        
} catch (error) {
        return res.json({success: false, message: error.message})
    }
}


const login = async (req,res)=>{
    const {email, password} = req.body
    if(!email ||!password){
        return res.json({success: false, message:"Missing details"})
    }

    try {

        const user = await userModel.findOne({email})
        
        if(!user){
            return res.json({success: false, message:"User not found"})
        }

        const isMatch = await bcrypt.compare(password, user.password)
        
        if(!isMatch){
            return res.json({success: false, message:"Invalid password"})
        }
        const token = jwt.sign({id: user._id,role: user.role}, process.env.JWT_SECRET, {expiresIn: '7d'})

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV=== 'production' ? 'none' : 'strict',
            maxAge: 7* 24 * 60 * 60 *1000
        })
        return res.json({success: true, message: "User logged in successfully"})
        
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}


const logOut = async (req,res)=>{

    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV=== 'production' ? 'none' : 'strict',
            maxAge: 7* 24 * 60 * 60 *1000
        })
        return res.json({success: true, message:"log out"})
        
    } catch (error) {
        res.json({success: false, message: error.message})
    }

}

const sendVerifyOtp = async (req,res) => {
    try {
        const {userId} = req.body;
        const user = await userModel.findById(userId);

        if(user.isAccountVerified){
            return res.json({success: false, message:"Account already verified"});
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOTP = otp;
        user.verifyOTPExpiredAt = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();

        const html = OtpCodeEmail(otp); // Using the fixed template

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Your OTP is: ",
            html: html
        };
        await transporter.sendMail(mailOptions);

        res.json({success: true, message:"Verified OTP sent to Email"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
};

const verifiedEmail = async (req,res)=>{
    const {userId, otp} = req.body

    if(!userId || !otp){
        return res.json({success: false, message: "Missing Details"})
    }

    try {
        const user = await userModel.findById(userId)

        if(!user){
            return res.json({success: false, message: "User not found"})
        }

        if(user.verifyOTP === "" || user.verifyOTP !== otp){
            return res.json({success: false, message: "Invalid OTP"})
        }

        if(user.verifyOTPExpiredAt < Date.now()){
            return res.json({success: false, message: "OTP expired"})
        }

        user.isAccountVerified = true
        user.verifyOTP = ''
        user.verifyOTPExpiredAt = 0

        await user.save()
        return res.json({success: true, message: "Email Verified Successfully"})

    } catch (error) {
        res.json({success: false, message: error.message})
    }

}

const isAuthenticated = async(req,res)=>{
    try {
        res.json({success: true, role: req.user.role})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

const sendResetOtp = async(req,res)=>{
    const {email} = req.body

    if(!email) {
        return res.json({success: false, message: "Email is required"})

    }

    try {
        const user = await userModel.findOne({email})
        if(!user){
            return res.json({success: false, message: "User not found"})
        }
        const otp = String(Math.floor(100000+ Math.random() * 900000))
        user.resetOTP = otp
        user.resetOTPExpireAt = Date.now() + 15 * 60 * 1000

        await user.save()

        const mailOptions = {
            from : process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Password reset OTP",
            text: `Your OTP will be expired in 15 minutes: ${otp}`
        }
        await transporter.sendMail(mailOptions)

        res.json({success: true, message:"OTP send on Email"})
        
    } catch (error) {
        return res.json({success: false, message: error.message})
        
    }
}

const resetPassword = async(req,res)=>{
    const {email, otp, newPassword} = req.body

    if(!email ||!otp ||!newPassword){
        return res.json({success: false, message:"Missing details"})
    }

    try {
        
        const user = await userModel.findOne({email})
        if (!user){
            return res.json({success: false, message: "User not found"})
        }
        if(user.resetOTP == "" || user.resetOTP !== otp){
            return res.json({success: false, message: "Invalid OTP"})
        }

        if(user.resetOTPExpireAt < Date.now()){
            return res.json({success: false, message: "OTP expired"})
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashedPassword
        user.resetOTP = ''
        user.resetOTPExpireAt = 0
        await user.save()
        return res.json({success: true, message: "Password reset successfully"})

    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

module.exports ={
    register,
    login,
    logOut,
    sendVerifyOtp,
    verifiedEmail,
    isAuthenticated,
    sendResetOtp,
    resetPassword
 
}