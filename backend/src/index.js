const express = require('express');
const cors = require('cors');
require('dotenv/config');
const cookieParser = require('cookie-parser');
const http = require('http'); 
const { Server } = require('socket.io'); // 🆕

const connectDB = require('./config/mongodb');
const authRoute = require('./routes/auth.route');
const userRoute = require('./routes/user.route');
const eventRoute = require('./routes/event.route');
const registrationRoute = require('./routes/registration.route');
const reviewRoute = require('./routes/review.route');
const paypalRoutes = require('./routes/paypal.route');

const app = express();
const server = http.createServer(app); 
const port = process.env.PORT || 5050;
const allowedOrigin = ['http://localhost:5173'];


connectDB();


app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());


app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/event', eventRoute);
app.use('/api/registration', registrationRoute);
app.use('/api/review', reviewRoute);
app.use('/api/paypal', paypalRoutes);


const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`✅ Socket connected: ${socket.id}`);

  socket.on('send_notification', (data) => {
    io.emit('receive_notification', data); // Broadcast to all
  });

  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});


app.set('io', io);


server.listen(port, () => {
  console.log(`🚀 Server is listening on port ${port}`);
});
