const supabase = require('../config/database');

const initializeSocket = (io) => {
  const userSockets = new Map(); // Map of userId -> socketId
  const conversationRooms = new Map(); // Map of roomId -> Set of participants

  io.on("connection", (socket) => {
    // User joins
    socket.on("user:join", (userId) => {
      userSockets.set(userId, socket.id);
      socket.userId = userId;
      socket.emit("connection:success", { socketId: socket.id });
    });

    // Join chat room
    socket.on("chat:join", (data) => {
      const { roomId, userId, otherUserId } = data;
      socket.join(roomId);

      if (!conversationRooms.has(roomId)) {
        conversationRooms.set(roomId, new Set());
      }
      conversationRooms.get(roomId).add(userId);

      // Notify other user that someone joined
      io.to(roomId).emit("chat:user-joined", { userId });
    });

    // Send message
    socket.on("chat:send-message", async (data) => {
      try {
        const { roomId, message, tempId  } = data;

        //  get receiver from room
        const { data: room } = await supabase
          .from("chat_rooms")
          .select("*")
          .eq("id", roomId)
          .single();

        if (!room) return;

        const receiverId =
          socket.userId === room.patient_id ? room.doctor_id : room.patient_id;

        // ✅ save message
        const { data: savedMessage, error } = await supabase
          .from("chat_messages")
          .insert([
            {
              room_id: roomId,
              sender_id: socket.userId,
              receiver_id: receiverId,
              message,
            },
          ])
          .select()
          .single();

        if (error) {
          console.error("DB Error:", error);
          return;
        }

        // ✅ emit to room
        io.to(roomId).emit("chat:receive-message", {
          id: savedMessage.id,
          userId: socket.userId,
          message: savedMessage.message,
          timestamp: savedMessage.created_at,
          tempId // send tempId back to client for matching
        });
      } catch (err) {
        console.error("Socket Error:", err);
      }
    });

    // Typing indicator
    socket.on("chat:typing", (data) => {
      const { roomId, userId } = data;
      socket.to(roomId).emit("chat:typing-status", { userId, isTyping: true });
    });

    // Stop typing
    socket.on("chat:stop-typing", (data) => {
      const { roomId, userId } = data;
      socket.to(roomId).emit("chat:typing-status", { userId, isTyping: false });
    });

    // Leave room
    socket.on("chat:leave", (data) => {
      const { roomId, userId } = data;
      socket.leave(roomId);

      if (conversationRooms.has(roomId)) {
        conversationRooms.get(roomId).delete(userId);
      }

      io.to(roomId).emit("chat:user-left", { userId });
    });

    // Disconnect
    socket.on("disconnect", () => {
      userSockets.delete(socket.userId);
      console.log("Client disconnected:", socket.id);
    });
  });
};

module.exports = { initializeSocket };
