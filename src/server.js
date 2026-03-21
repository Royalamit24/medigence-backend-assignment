const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const { authenticateToken } = require('./middleware/authMiddleware');
const { initializeSocket } = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

// ✅ FIXED FRONTEND URL
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ✅ FIXED CORS (IMPORTANT)
app.use(cors());

app.use(express.json());

// ✅ FIXED SOCKET CONFIG
const io = socketIo(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket'] // 🔥 FORCE WEBSOCKET (FIX POLLING ISSUE)
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', authenticateToken, patientRoutes);
app.use('/api/doctors', authenticateToken, doctorRoutes);

// Socket.io initialization
initializeSocket(io);

// Test route
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});