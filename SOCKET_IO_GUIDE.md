# Real-Time Chat - Socket.io Documentation

Complete guide for implementing real-time patient-doctor chat using Socket.io.

---

## SOCKET.IO SETUP

### Server Configuration (Already Implemented)
```javascript
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});
```

### Client Setup (Frontend Example)

**Install Socket.io client:**
```bash
npm install socket.io-client
```

**Initialize connection:**
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});
```

---

## SOCKET.IO EVENTS

### 1. Connection Establishment

#### Event: `connection:success`
**Triggered by:** Server when client connects  
**Use:** To confirm socket connection and get socket ID

**Client Code:**
```javascript
socket.on('connection:success', (data) => {
  console.log('Connected with socket ID:', data.socketId);
  // Store or use the socket ID if needed
});
```

---

### 2. User Join

#### Event: `user:join`
**Sent by:** Client to register user  
**Purpose:** Tell server which user is connecting

**Client Code:**
```javascript
// Called when user logs in or component mounts
socket.emit('user:join', userId);
// Example:
socket.emit('user:join', 'patient-123');
```

**Parameters:**
- `userId` (string): The UUID of the logged-in user

---

### 3. Join Chat Room

#### Event: `chat:join`
**Sent by:** Patient or doctor to enter chat room  
**Purpose:** Notify server and other participants that user joined

**Client Code:**
```javascript
socket.emit('chat:join', {
  roomId: 'patient-123-doctor-456',
  userId: 'patient-123',
  otherUserId: 'doctor-456'
});
```

**Server broadcasts:** `chat:user-joined` to all in room
```javascript
socket.on('chat:user-joined', (data) => {
  console.log(`User ${data.userId} joined the chat`);
  // Update UI - show "user is online"
});
```

**Parameters:**
- `roomId` (string): Format: `{patientId}-{doctorId}`
- `userId` (string): Current user's UUID
- `otherUserId` (string): UUID of the other participant

---

### 4. Send Message

#### Event: `chat:send-message`
**Sent by:** Patient or doctor when sending a message  
**Purpose:** Send message to chat room

**Client Code:**
```javascript
socket.emit('chat:send-message', {
  roomId: 'patient-123-doctor-456',
  message: 'Hello, I have symptoms of headache',
  timestamp: new Date().toISOString()
});
```

**Server broadcasts:** `chat:receive-message` to all in room
```javascript
socket.on('chat:receive-message', (data) => {
  console.log(`${data.userId}: ${data.message}`);
  // Add message to chat UI
  addMessageToChat({
    senderId: data.userId,
    message: data.message,
    timestamp: data.timestamp,
    isOwn: data.userId === currentUserId
  });
});
```

**Parameters:**
- `roomId` (string): Chat room ID
- `message` (string): Message text
- `timestamp` (string): ISO 8601 timestamp

**Received Data:**
- `userId` (string): Sender's UUID
- `message` (string): Message text
- `timestamp` (string): Message timestamp

---

### 5. Typing Indicator

#### Event: `chat:typing`
**Sent by:** User when they start typing  
**Purpose:** Show typing status to other user

**Client Code:**
```javascript
// On input focus or key press
socket.emit('chat:typing', {
  roomId: 'patient-123-doctor-456',
  userId: 'patient-123'
});
```

**Server broadcasts:** `chat:typing-status` to all in room
```javascript
socket.on('chat:typing-status', (data) => {
  if (data.isTyping) {
    console.log(`${data.userId} is typing...`);
    // Show typing indicator
    showTypingIndicator(data.userId);
  } else {
    hideTypingIndicator(data.userId);
  }
});
```

**Parameters:**
- `roomId` (string): Chat room ID
- `userId` (string): User who is typing

**Received Data:**
- `userId` (string): User UUID
- `isTyping` (boolean): Always `true` for this event

#### Event: `chat:stop-typing`
**Sent by:** User when they stop typing or send message  
**Purpose:** Stop showing typing indicator

**Client Code:**
```javascript
// On input blur or after sending message
socket.emit('chat:stop-typing', {
  roomId: 'patient-123-doctor-456',
  userId: 'patient-123'
});
```

**Received Data:**
- `userId` (string): User UUID
- `isTyping` (boolean): Always `false` for this event

---

### 6. Leave Chat Room

#### Event: `chat:leave`
**Sent by:** User when leaving chat  
**Purpose:** Notify others that user is away

**Client Code:**
```javascript
// On page unload or chat close
window.addEventListener('beforeunload', () => {
  socket.emit('chat:leave', {
    roomId: 'patient-123-doctor-456',
    userId: 'patient-123'
  });
});

// Or on explicit close
function closeChatRoom() {
  socket.emit('chat:leave', {
    roomId: 'patient-123-doctor-456',
    userId: 'patient-123'
  });
}
```

**Server broadcasts:** `chat:user-left` to all in room
```javascript
socket.on('chat:user-left', (data) => {
  console.log(`User ${data.userId} left the chat`);
  // Update UI - show "user is offline"
});
```

**Parameters:**
- `roomId` (string): Chat room ID
- `userId` (string): User who is leaving

---

### 7. Disconnect

#### Event: `disconnect`
**Triggered by:** Server when connection closes  
**Purpose:** Clean up user session

**Client Code:**
```javascript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  // Show offline status
  // Attempt to reconnect
});
```

---

## COMPLETE REACT EXAMPLE

```jsx
import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const ChatComponent = ({ patientId, doctorId, roomId }) => {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState({});
  const [isOnline, setIsOnline] = useState({});

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('http://localhost:5000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Connection success
    socketRef.current.on('connection:success', (data) => {
      console.log('Socket connected:', data.socketId);
    });

    // Register user
    socketRef.current.emit('user:join', patientId);

    // Join chat room
    socketRef.current.emit('chat:join', {
      roomId,
      userId: patientId,
      otherUserId: doctorId,
    });

    // Listen for user joined
    socketRef.current.on('chat:user-joined', (data) => {
      setIsOnline((prev) => ({ ...prev, [data.userId]: true }));
    });

    // Listen for messages
    socketRef.current.on('chat:receive-message', (data) => {
      setMessages((prev) => [...prev, {
        id: Date.now(),
        senderId: data.userId,
        message: data.message,
        timestamp: data.timestamp,
        isOwn: data.userId === patientId,
      }]);
    });

    // Listen for typing
    socketRef.current.on('chat:typing-status', (data) => {
      setIsTyping((prev) => ({
        ...prev,
        [data.userId]: data.isTyping,
      }));
    });

    // Listen for user left
    socketRef.current.on('chat:user-left', (data) => {
      setIsOnline((prev) => ({ ...prev, [data.userId]: false }));
    });

    return () => {
      socketRef.current.emit('chat:leave', {
        roomId,
        userId: patientId,
      });
      socketRef.current.disconnect();
    };
  }, [patientId, doctorId, roomId]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    socketRef.current.emit('chat:send-message', {
      roomId,
      message: inputValue,
      timestamp: new Date().toISOString(),
    });

    socketRef.current.emit('chat:stop-typing', {
      roomId,
      userId: patientId,
    });

    setInputValue('');
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.length > 0) {
      socketRef.current.emit('chat:typing', {
        roomId,
        userId: patientId,
      });
    } else {
      socketRef.current.emit('chat:stop-typing', {
        roomId,
        userId: patientId,
      });
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.isOwn ? 'own' : 'other'}`}>
            <p>{msg.message}</p>
            <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
          </div>
        ))}

        {Object.entries(isTyping).map(([userId, typing]) =>
          typing && <div key={userId} className="typing">User is typing...</div>
        )}
      </div>

      <div className="input-area">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type a message..."
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatComponent;
```

---

## VANILLA JAVASCRIPT EXAMPLE

```javascript
class ChatManager {
  constructor(userId, roomId, otherUserId) {
    this.userId = userId;
    this.roomId = roomId;
    this.otherUserId = otherUserId;
    this.socket = null;
    this.messages = [];
  }

  connect() {
    this.socket = io('http://localhost:5000');

    this.socket.on('connection:success', (data) => {
      console.log('Connected:', data.socketId);
    });

    this.socket.emit('user:join', this.userId);
    this.socket.emit('chat:join', {
      roomId: this.roomId,
      userId: this.userId,
      otherUserId: this.otherUserId,
    });

    this.socket.on('chat:receive-message', (data) => {
      this.messages.push(data);
      this.renderMessages();
    });

    this.socket.on('chat:typing-status', (data) => {
      this.updateTypingStatus(data);
    });
  }

  sendMessage(messageText) {
    this.socket.emit('chat:send-message', {
      roomId: this.roomId,
      message: messageText,
      timestamp: new Date().toISOString(),
    });
  }

  emitTyping(isTyping) {
    const event = isTyping ? 'chat:typing' : 'chat:stop-typing';
    this.socket.emit(event, {
      roomId: this.roomId,
      userId: this.userId,
    });
  }

  renderMessages() {
    const messagesContainer = document.getElementById('messages');
    messagesContainer.innerHTML = this.messages
      .map((msg) => `
        <div class="message ${msg.userId === this.userId ? 'own' : 'other'}">
          <p>${msg.message}</p>
          <small>${new Date(msg.timestamp).toLocaleTimeString()}</small>
        </div>
      `)
      .join('');
  }

  updateTypingStatus(data) {
    const typingIndicator = document.getElementById('typing');
    if (data.isTyping) {
      typingIndicator.textContent = 'User is typing...';
    } else {
      typingIndicator.textContent = '';
    }
  }

  disconnect() {
    this.socket.emit('chat:leave', {
      roomId: this.roomId,
      userId: this.userId,
    });
    this.socket.disconnect();
  }
}

// Usage
const chat = new ChatManager(
  'patient-123',
  'patient-123-doctor-456',
  'doctor-456'
);

chat.connect();

// Send message on button click
document.getElementById('sendBtn').addEventListener('click', () => {
  const input = document.getElementById('messageInput');
  chat.sendMessage(input.value);
  input.value = '';
});

// Track typing
document.getElementById('messageInput').addEventListener('keydown', () => {
  chat.emitTyping(true);
});

document.getElementById('messageInput').addEventListener('keyup', () => {
  chat.emitTyping(false);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  chat.disconnect();
});
```

---

## BEST PRACTICES

### 1. Connection Management
```javascript
// Always use reconnection options
const socket = io(url, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});
```

### 2. Error Handling
```javascript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  // Retry connection or show error to user
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  // Handle disconnection gracefully
});
```

### 3. Message Persistence
```javascript
// Save message to database before confirming delivery
socket.emit('chat:send-message', {
  roomId,
  message,
  timestamp,
  requiresAck: true,
});

// Acknowledge receipt
socket.on('message:saved', (data) => {
  console.log('Message saved:', data.messageId);
});
```

### 4. Online Status
```javascript
// Track online users
const onlineUsers = {};

socket.on('chat:user-joined', (data) => {
  onlineUsers[data.userId] = true;
  updateUserStatus(data.userId, 'online');
});

socket.on('chat:user-left', (data) => {
  onlineUsers[data.userId] = false;
  updateUserStatus(data.userId, 'offline');
});
```

### 5. Memory Management
```javascript
// Clean up listeners when component unmounts
return () => {
  socket.off('chat:receive-message');
  socket.off('chat:typing-status');
  socket.off('chat:user-joined');
  socket.off('chat:user-left');
  socket.disconnect();
};
```

---

## TROUBLESHOOTING

### Issue: Socket not connecting
**Solution:**
- Check CORS settings in `src/server.js`
- Verify `FRONTEND_URL` in `.env`
- Ensure server is running

### Issue: Messages not persisted
**Solution:**
- Implement message saving in socket event handlers (TODO: Add to socketHandler.js)
- Use database queries to save messages before emit

### Issue: Typing indicators not working
**Solution:**
- Clear typing status on message send
- Add timeout to auto-clear typing status after inactivity

### Issue: Disconnect issues
**Solution:**
- Add proper cleanup in useEffect
- Emit leave event before disconnect
- Implement reconnection logic

---

## FUTURE ENHANCEMENTS

1. **Message Persistence**: Save all messages to database
2. **Read Receipts**: Track which messages have been read
3. **Unread Count**: Show unread message count
4. **Message Search**: Search across messages
5. **Attachment Support**: Send images and files
6. **Voice/Video**: Add WebRTC for calls
7. **Message Reactions**: Allow emoji reactions
8. **User Presence**: Show "seen at" timestamps
