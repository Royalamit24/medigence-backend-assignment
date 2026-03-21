# Medigence Backend - Medical Application

A comprehensive Node.js backend for a medical application featuring patient onboarding, doctor assignment, and real-time chat using Express, JWT authentication, and Supabase.

## Features

- **JWT-Based Authentication** - Custom JWT authentication supporting patient and doctor roles
- **Patient Onboarding** - Multi-step form with draft saving and progress tracking
- **Real-Time Chat** - Socket.io-based messaging between patients and doctors
- **Secure Password Hashing** - Using bcryptjs for password security
- **Role-Based Access Control** - Different endpoints for patients and doctors

## Project Structure

```
src/
├── config/          # Configuration files (database connection)
├── controllers/     # Business logic for routes
├── middleware/      # Authentication and authorization middleware
├── models/          # Data models (ready for expansion)
├── routes/          # API route definitions
├── socket/          # Socket.io event handlers
├── utils/           # Utility functions (JWT, password hashing)
├── validators/      # Input validation schemas
└── server.js        # Main server entry point

database/
└── schema.sql       # Supabase database schema

.env.example         # Environment variables template
package.json         # Dependencies and scripts
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- Supabase account and project
- npm or yarn

### Setup

1. **Clone and install dependencies**
```bash
npm install
```

2. **Install required packages**
```bash
npm install express cors dotenv jsonwebtoken bcryptjs socket.io @supabase/supabase-js
npm install --save-dev nodemon
```

3. **Set up environment variables**
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

4. **Create Supabase database**
- Create a Supabase project
- Run the SQL schema from `database/schema.sql` in the Supabase SQL editor
- Copy your Supabase URL and keys to `.env`

5. **Start the server**
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user (patient/doctor)
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh JWT token

### Patient Routes (Protected)
- `POST /api/patients/onboarding/save-draft` - Save onboarding draft
- `GET /api/patients/onboarding/draft` - Get saved draft
- `POST /api/patients/onboarding/submit` - Submit complete onboarding
- `GET /api/patients/profile` - Get patient profile
- `GET /api/patients/doctor` - Get assigned doctor

### Doctor Routes (Protected)
- `GET /api/doctors/patients` - Get assigned patients
- `GET /api/doctors/patients/:patientId` - Get specific patient details
- `GET /api/doctors/profile` - Get doctor profile

## Socket.io Events

### Client -> Server
- `user:join` - User connects to socket
- `chat:join` - Join a chat room
- `chat:send-message` - Send a message
- `chat:typing` - User is typing
- `chat:stop-typing` - User stopped typing
- `chat:leave` - Leave chat room

### Server -> Client
- `connection:success` - Connection established
- `chat:user-joined` - Another user joined the room
- `chat:receive-message` - New message arrived
- `chat:typing-status` - Typing indicator update
- `chat:user-left` - User left the room

## Environment Variables

```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_connection_string
```

## Next Steps

1. Implement input validation in `src/validators/`
2. Add comprehensive error handling
3. Implement doctor assignment logic for onboarding
4. Add message persistence in Socket.io handlers
5. Implement unread message counting
6. Add logging and monitoring
7. Implement rate limiting
8. Add API documentation (Swagger/OpenAPI)

## Technologies Used

- **Express** - Web framework
- **JWT** - Authentication
- **Bcryptjs** - Password hashing
- **Socket.io** - Real-time communication
- **Supabase** - Database
- **dotenv** - Environment configuration
- **CORS** - Cross-origin requests

## License

MIT
