const initializeSocket = (io) => {
  const userSockets = new Map(); // Map of userId -> socketId
  const conversationRooms = new Map(); // Map of roomId -> Set of participants

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // User joins
    socket.on('user:join', (userId) => {
      userSockets.set(userId, socket.id);
      socket.userId = userId;
      socket.emit('connection:success', { socketId: socket.id });
    });

    // Join chat room
    socket.on('chat:join', (data) => {
      const { roomId, userId, otherUserId } = data;
      socket.join(roomId);

      if (!conversationRooms.has(roomId)) {
        conversationRooms.set(roomId, new Set());
      }
      conversationRooms.get(roomId).add(userId);

      // Notify other user that someone joined
      io.to(roomId).emit('chat:user-joined', { userId });
    });

    // Send message
    socket.on('chat:send-message', (data) => {
      const { roomId, message, timestamp } = data;
      io.to(roomId).emit('chat:receive-message', {
        userId: socket.userId,
        message,
        timestamp,
      });
    });

    // Typing indicator
    socket.on('chat:typing', (data) => {
      const { roomId, userId } = data;
      socket.to(roomId).emit('chat:typing-status', { userId, isTyping: true });
    });

    // Stop typing
    socket.on('chat:stop-typing', (data) => {
      const { roomId, userId } = data;
      socket.to(roomId).emit('chat:typing-status', { userId, isTyping: false });
    });

    // Leave room
    socket.on('chat:leave', (data) => {
      const { roomId, userId } = data;
      socket.leave(roomId);

      if (conversationRooms.has(roomId)) {
        conversationRooms.get(roomId).delete(userId);
      }

      io.to(roomId).emit('chat:user-left', { userId });
    });

    // Disconnect
    socket.on('disconnect', () => {
      userSockets.delete(socket.userId);
      console.log('Client disconnected:', socket.id);
    });
  });
};

module.exports = { initializeSocket };
