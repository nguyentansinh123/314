const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5055;

const allowedOrigin = ['http://localhost:5173'];

app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());



const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`✅ Socket connected: ${socket.id}`);

  socket.on('send_notification', (data) => {
    io.emit('receive_notification', data);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

server.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
