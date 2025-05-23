const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});


io.on('connection', (socket) => {
  console.log(`⚡ User connected: ${socket.id}`);

  socket.on('send_notification', (data) => {
    io.emit('receive_notification', data); 
  });

  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});


server.listen(5055, () => {
  console.log('🚀 Server running on port 5055');
});
