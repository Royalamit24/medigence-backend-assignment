// Setup guide for the Medigence Backend

## Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase

#### Create a Supabase Project:
- Go to https://supabase.com
- Create a new project
- Go to Settings > API to get your URL and keys

#### Create Database Schema:
- Go to the SQL Editor in Supabase
- Copy the entire content from `database/schema.sql`
- Paste and run the SQL

### 3. Environment Configuration

Create a `.env` file in the root directory with:
```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRY=7d

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
DATABASE_URL=postgres://user:password@db.supabase.co:5432/postgres
```

### 4. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will be available at `http://localhost:5000`

---

## API Testing

### 1. Signup (Create Account)
```bash
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "email": "patient@example.com",
  "password": "SecurePassword123!",
  "fullName": "John Doe",
  "role": "patient"
}
```

### 2. Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "patient@example.com",
  "password": "SecurePassword123!"
}
```

### 3. Save Onboarding Draft
```bash
POST http://localhost:5000/api/patients/onboarding/save-draft
Content-Type: application/json
Authorization: Bearer <your_jwt_token>

{
  "step": 1,
  "data": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "dateOfBirth": "1990-01-15",
    "phone": "1234567890",
    "address": "123 Main St, City, State"
  }
}
```

### 4. Get Onboarding Draft
```bash
GET http://localhost:5000/api/patients/onboarding/draft
Authorization: Bearer <your_jwt_token>
```

### 5. Submit Onboarding
```bash
POST http://localhost:5000/api/patients/onboarding/submit
Content-Type: application/json
Authorization: Bearer <your_jwt_token>

{
  "personalInfo": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "dateOfBirth": "1990-01-15",
    "phone": "1234567890",
    "address": "123 Main St, City, State"
  },
  "medicalHistory": {
    "allergies": ["Penicillin"],
    "medicalConditions": ["Diabetes"],
    "currentMedications": ["Metformin"]
  },
  "insuranceDetails": {
    "provider": "Blue Cross",
    "policyNumber": "BC123456",
    "groupNumber": "GRP789"
  }
}
```

---

## Socket.io Chat Events

### Client Connection
```javascript
const socket = io('http://localhost:5000');

// Register user
socket.emit('user:join', 'user-id-here');

// Listen for successful connection
socket.on('connection:success', (data) => {
  console.log('Connected:', data.socketId);
});
```

### Join Chat Room
```javascript
socket.emit('chat:join', {
  roomId: 'patient-doctor-123',
  userId: 'patient-id',
  otherUserId: 'doctor-id'
});
```

### Send Message
```javascript
socket.emit('chat:send-message', {
  roomId: 'patient-doctor-123',
  message: 'Hello doctor!',
  timestamp: new Date()
});

// Receive messages
socket.on('chat:receive-message', (data) => {
  console.log(`${data.userId}: ${data.message}`);
});
```

### Typing Indicator
```javascript
// User is typing
socket.emit('chat:typing', {
  roomId: 'patient-doctor-123',
  userId: 'patient-id'
});

// Listen for typing status
socket.on('chat:typing-status', (data) => {
  console.log(`${data.userId} is ${data.isTyping ? 'typing...' : 'not typing'}`);
});

// Stop typing
socket.emit('chat:stop-typing', {
  roomId: 'patient-doctor-123',
  userId: 'patient-id'
});
```

---

## Project Folder Structure

```
medigence-backend-assignment/
├── src/
│   ├── config/
│   │   └── database.js           # Supabase connection
│   ├── controllers/
│   │   ├── authController.js     # Auth logic (signup, login)
│   │   ├── patientController.js  # Patient operations
│   │   └── doctorController.js   # Doctor operations
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification & role checks
│   ├── models/
│   │   └── (ready for expansion)
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── patientRoutes.js      # Patient endpoints
│   │   └── doctorRoutes.js       # Doctor endpoints
│   ├── socket/
│   │   └── socketHandler.js      # Real-time chat events
│   ├── utils/
│   │   ├── jwtUtils.js           # Token generation/verification
│   │   └── passwordUtils.js      # Password hashing
│   ├── validators/
│   │   └── onboardingValidator.js # Input validation
│   └── server.js                 # Main server file
├── database/
│   └── schema.sql                # Supabase schema
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies
└── README.md                     # Documentation
```

---

## Next Steps to Complete the Project

1. **Add Error Handling**: Implement comprehensive try-catch blocks
2. **Message Persistence**: Save messages to database in socketHandler
3. **Add Unread Count**: Track unread messages for chat
4. **Doctor Assignment**: Implement logic to assign available doctors to patients
5. **Input Validation**: Use onboardingValidator in controllers
6. **Rate Limiting**: Add express-rate-limit
7. **API Documentation**: Generate Swagger/OpenAPI docs
8. **Write Tests**: Add unit and integration tests
9. **Add Logging**: Implement logging service
10. **Add Search**: Add patient search functionality for doctors

---

## Common Issues & Troubleshooting

### CORS Error
Make sure `FRONTEND_URL` in `.env` matches your frontend URL

### JWT Token Invalid
Ensure `JWT_SECRET` is set in `.env` and matches across all environments

### Supabase Connection Failed
- Verify `SUPABASE_URL` and `SUPABASE_KEY` are correct
- Check if database schema is created
- Ensure Supabase project is active

### Socket.io Connection Issues
- Check CORS settings in server.js
- Verify frontend is using same socket server URL
- Check browser console for connection errors

---

## Deployment Notes

Before deploying:
1. Change `JWT_SECRET` to a strong random string
2. Set `NODE_ENV=production`
3. Use environment-specific credentials
4. Enable HTTPS/WSS for Socket.io
5. Set up proper logging and monitoring
6. Configure database backups
7. Add rate limiting
8. Enable request validation
