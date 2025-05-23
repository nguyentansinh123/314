const express = require('express')
const cors = require('cors')
require('dotenv/config')
const cookieParser = require('cookie-parser')
const http = require('http')
const connectDB = require('./config/mongodb')
const { initSocket } = require('./config/socket')
const authRoute = require('./routes/auth.route')
const userRoute = require('./routes/user.route')
const eventRoute = require('./routes/event.route')
const registrationRoute = require('./routes/registration.route')
const reviewRoute = require('./routes/review.route')
const paypalRoutes = require('./routes/paypal.route')
const messageRoutes = require('./routes/message.route')
const notificationRoutes = require('./routes/notification.route')

const app = express()
const server = http.createServer(app)

console.log('Initializing Socket.IO...');
const io = initSocket(server)
console.log('Socket.IO initialized');

const allowedOrigin = ['http://localhost:5173']

const port = process.env.PORT || 5000
connectDB()

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}))

app.use(express.json({ limit: '50mb' }))
app.use(cookieParser())

app.use('/api/auth', authRoute)
app.use('/api/user', userRoute)
app.use('/api/event', eventRoute)
app.use('/api/registration', registrationRoute)
app.use('/api/review', reviewRoute)
app.use('/api/paypal', paypalRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/notifications', notificationRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', socketActive: !!io });
});

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
    console.log(`Socket.IO is enabled and waiting for connections`);
})
