const express = require('express')
const cors = require('cors')
require('dotenv/config')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/mongodb')
const authRoute = require('./routes/auth.route')
const userRoute = require('./routes/user.route')
const eventRoute = require('./routes/event.route')
const registrationRoute = require('./routes/registration.route')
const reviewRoute = require('./routes/review.route')

const app = express()

const allowedOrigin = ['http://localhost:5173']

const port = process.env.PORT || 5000
// console.log('Connecting to:', process.env.MONGODB_URL);
connectDB()
app.use(cors({origin: allowedOrigin,credentials: true}))
app.use(express.json())
app.use(cookieParser())
app.use('/api/auth',authRoute)
app.use('/api/user',userRoute)
app.use('/api/event',eventRoute)
app.use('/api/registration',registrationRoute)
app.use('/api/review',reviewRoute)

app.listen(port, ()=>{
    console.log(`server is listenning on ${port}`);
    
})
