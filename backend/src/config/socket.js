const { Server } = require('socket.io');

let io;
const userSocketMap = {}; // {userId: socketId}

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173'],
      credentials: true,
      methods: ['GET', 'POST']
    },
    // Important! Allow Socket.IO v2 clients to connect
    allowEIO3: true,
    // Other settings
    pingTimeout: 60000,
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap[userId] = socket.id;
      console.log(`User ${userId} connected with socket ${socket.id}`);
    }
    
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
    
    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected, reason: ${reason}`);
      
      for (const [key, value] of Object.entries(userSocketMap)) {
        if (value === socket.id) {
          delete userSocketMap[key];
          console.log(`User ${key} removed from active connections`);
          break;
        }
      }
      
      io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
  });

  return io;
}

function getReceiverSocketId(receiverId) {
  return userSocketMap[receiverId];
}

module.exports = { 
  initSocket, 
  getReceiverSocketId,
  get io() { return io; }  
};