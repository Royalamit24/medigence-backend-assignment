# Medigence Frontend - React Implementation Guide

Complete guide for building the frontend React application to communicate with the Medigence backend API.

---

## TABLE OF CONTENTS
1. [Project Setup](#project-setup)
2. [Folder Structure](#folder-structure)
3. [Authentication System](#authentication-system)
4. [API Service Layer](#api-service-layer)
5. [Onboarding Form](#onboarding-form)
6. [Real-Time Chat](#real-time-chat)
7. [Doctor Dashboard](#doctor-dashboard)
8. [Patient Dashboard](#patient-dashboard)
9. [Socket.io Integration](#socketio-integration)
10. [Error Handling](#error-handling)
11. [Complete Examples](#complete-examples)

---

## PROJECT SETUP

### 1. Create React App
```bash
npx create-react-app medigence-frontend
cd medigence-frontend
npm install axios socket.io-client react-router-dom
```

### 2. Environment Setup
Create `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 3. Folder Structure
```
src/
├── components/
│   ├── Auth/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   └── ProtectedRoute.jsx
│   ├── Onboarding/
│   │   ├── OnboardingForm.jsx
│   │   ├── PersonalInfoStep.jsx
│   │   ├── MedicalHistoryStep.jsx
│   │   ├── InsuranceStep.jsx
│   │   └── OnboardingSummary.jsx
│   ├── Chat/
│   │   ├── ChatWindow.jsx
│   │   ├── MessageList.jsx
│   │   ├── MessageInput.jsx
│   │   └── TypingIndicator.jsx
│   ├── Dashboard/
│   │   ├── PatientDashboard.jsx
│   │   └── DoctorDashboard.jsx
│   └── Common/
│       ├── Navbar.jsx
│       └── LoadingSpinner.jsx
├── services/
│   ├── api.js
│   └── socket.js
├── contexts/
│   ├── AuthContext.jsx
│   └── ChatContext.jsx
├── utils/
│   ├── validators.js
│   ├── formatters.js
│   └── constants.js
├── hooks/
│   ├── useAuth.js
│   └── useSocket.js
├── App.jsx
└── index.js
```

---

## AUTHENTICATION SYSTEM

### AuthContext.jsx - Global Auth State

```jsx
import React, { createContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize token in localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const signup = useCallback(async (email, password, fullName, role) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/signup', {
        email,
        password,
        fullName,
        role,
      });
      setToken(response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Signup failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      setToken(response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    signup,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

### useAuth Hook

```jsx
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### ProtectedRoute.jsx

```jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
```

---

## API SERVICE LAYER

### services/api.js

```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Patient API Calls

```javascript
// Add to api.js or create separate patientApi.js

export const patientAPI = {
  // Onboarding
  submitOnboarding: (data) =>
    api.post('/patients/onboarding/submit', data),

  getProfile: () =>
    api.get('/patients/profile'),

  getAssignedDoctor: () =>
    api.get('/patients/doctor'),
};

export const doctorAPI = {
  // Doctor operations
  getAssignedPatients: () =>
    api.get('/doctors/patients'),

  getPatientDetails: (patientId) =>
    api.get(`/doctors/patients/${patientId}`),

  getProfile: () =>
    api.get('/doctors/profile'),
};
```

---

## ONBOARDING FORM

### Complete Onboarding Component

```jsx
// components/Onboarding/OnboardingForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import PersonalInfoStep from './PersonalInfoStep';
import MedicalHistoryStep from './MedicalHistoryStep';
import InsuranceStep from './InsuranceStep';
import OnboardingSummary from './OnboardingSummary';
import './OnboardingForm.css';

const OnboardingForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    personalInfo: {},
    medicalHistory: {},
    insuranceDetails: {},
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);

  // Fetch doctors on mount
  React.useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // Fetch from backend - create endpoint to get list of doctors
        // For now, using mock data
        setDoctors([
          { id: '1', full_name: 'Dr. Sarah Johnson', specialization: 'General Practice' },
          { id: '2', full_name: 'Dr. Michael Chen', specialization: 'Internal Medicine' },
        ]);
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
      }
    };
    fetchDoctors();
  }, []);

  const handlePersonalInfoChange = (data) => {
    setFormData((prev) => ({
      ...prev,
      personalInfo: data,
    }));
  };

  const handleMedicalHistoryChange = (data) => {
    setFormData((prev) => ({
      ...prev,
      medicalHistory: data,
    }));
  };

  const handleInsuranceChange = (data) => {
    setFormData((prev) => ({
      ...prev,
      insuranceDetails: data,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});
    try {
      const response = await api.post('/patients/onboarding/submit', formData);
      
      // Store chat room info
      localStorage.setItem('chatRoomId', response.data.roomId);
      localStorage.setItem('doctorId', response.data.doctorId);

      alert('Onboarding completed! You are now assigned to a doctor.');
      navigate('/dashboard');
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.errors) {
        setErrors(errorData.errors);
      } else {
        setErrors({ general: errorData?.error || 'Failed to submit onboarding' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-container">
      <h1>Complete Your Medical Profile</h1>
      
      <div className="onboarding-form">
        <PersonalInfoStep
          data={formData.personalInfo}
          onChange={handlePersonalInfoChange}
          errors={errors.personalInfo}
        />
        
        <MedicalHistoryStep
          data={formData.medicalHistory}
          onChange={handleMedicalHistoryChange}
          errors={errors.medicalHistory}
        />
        
        <InsuranceStep
          data={formData.insuranceDetails}
          onChange={handleInsuranceChange}
          errors={errors.insuranceDetails}
          doctors={doctors}
        />
        
        <OnboardingSummary data={formData} />
        
        {errors.general && <div className="error-message">{errors.general}</div>}
        
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="submit-button"
        >
          {loading ? 'Submitting...' : 'Complete Onboarding'}
        </button>
      </div>
    </div>
  );
};

export default OnboardingForm;
```

### PersonalInfoStep.jsx

```jsx
import React, { useState } from 'react';
import { validatePersonalInfo } from '../../utils/validators';

const PersonalInfoStep = ({ data, onChange, errors = {} }) => {
  const [formData, setFormData] = useState(data || {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = () => {
    onChange(formData);
  };

  return (
    <div className="step-container">
      <h2>Step 1: Personal Information</h2>
      
      <div className="form-group">
        <label>Full Name *</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="First and Last Name"
        />
        {errors?.fullName && <span className="error">{errors.fullName}</span>}
      </div>

      <div className="form-group">
        <label>Date of Birth *</label>
        <input
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth || ''}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {errors?.dateOfBirth && <span className="error">{errors.dateOfBirth}</span>}
      </div>

      <div className="form-group">
        <label>Gender *</label>
        <select
          name="gender"
          value={formData.gender || ''}
          onChange={handleChange}
          onBlur={handleBlur}
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer_not_to_say">Prefer Not to Say</option>
        </select>
        {errors?.gender && <span className="error">{errors.gender}</span>}
      </div>

      <div className="form-group">
        <label>Phone Number *</label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="1-234-567-8900"
        />
        {errors?.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
      </div>

      <div className="form-group">
        <label>Emergency Contact Name *</label>
        <input
          type="text"
          name="emergencyContactName"
          value={formData.emergencyContactName || ''}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {errors?.emergencyContactName && <span className="error">{errors.emergencyContactName}</span>}
      </div>

      <div className="form-group">
        <label>Emergency Contact Phone *</label>
        <input
          type="tel"
          name="emergencyContactPhone"
          value={formData.emergencyContactPhone || ''}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {errors?.emergencyContactPhone && <span className="error">{errors.emergencyContactPhone}</span>}
      </div>
    </div>
  );
};

export default PersonalInfoStep;
```

### MedicalHistoryStep.jsx

```jsx
import React, { useState } from 'react';

const MedicalHistoryStep = ({ data, onChange, errors = {} }) => {
  const [formData, setFormData] = useState(data || {});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      // Handle multi-select checkboxes
      const array = formData[name] || [];
      if (checked) {
        setFormData((prev) => ({
          ...prev,
          [name]: [...array, value],
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: array.filter((item) => item !== value),
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleBlur = () => {
    onChange(formData);
  };

  const allergies = ['penicillin', 'aspirin', 'sulfa', 'latex', 'shellfish', 'none', 'other'];
  const conditions = ['diabetes', 'hypertension', 'asthma', 'heart_disease', 'arthritis', 'none'];

  return (
    <div className="step-container">
      <h2>Step 2: Medical History</h2>

      <div className="form-group">
        <label>Blood Type *</label>
        <select
          name="bloodType"
          value={formData.bloodType || ''}
          onChange={handleChange}
          onBlur={handleBlur}
        >
          <option value="">Select Blood Type</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="unknown">Unknown</option>
        </select>
        {errors?.bloodType && <span className="error">{errors.bloodType}</span>}
      </div>

      <div className="form-group">
        <label>Current Medications (max 500 chars)</label>
        <textarea
          name="currentMedications"
          value={formData.currentMedications || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="List all current medications"
          maxLength={500}
        />
        <small>{(formData.currentMedications || '').length}/500</small>
        {errors?.currentMedications && <span className="error">{errors.currentMedications}</span>}
      </div>

      <div className="form-group">
        <label>Known Allergies</label>
        <div className="checkbox-group">
          {allergies.map((allergy) => (
            <label key={allergy} className="checkbox-label">
              <input
                type="checkbox"
                name="knownAllergies"
                value={allergy}
                checked={(formData.knownAllergies || []).includes(allergy)}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {allergy.charAt(0).toUpperCase() + allergy.slice(1)}
            </label>
          ))}
        </div>
        {errors?.knownAllergies && <span className="error">{errors.knownAllergies}</span>}
      </div>

      <div className="form-group">
        <label>Chronic Conditions</label>
        <div className="checkbox-group">
          {conditions.map((condition) => (
            <label key={condition} className="checkbox-label">
              <input
                type="checkbox"
                name="chronicConditions"
                value={condition}
                checked={(formData.chronicConditions || []).includes(condition)}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {condition.replace(/_/g, ' ').charAt(0).toUpperCase() + condition.replace(/_/g, ' ').slice(1)}
            </label>
          ))}
        </div>
        {errors?.chronicConditions && <span className="error">{errors.chronicConditions}</span>}
      </div>

      <div className="form-group">
        <label>Previous Surgeries</label>
        <textarea
          name="previousSurgeries"
          value={formData.previousSurgeries || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="List any previous surgeries"
        />
      </div>

      <div className="form-group">
        <label>Family Medical History (max 300 chars)</label>
        <textarea
          name="familyMedicalHistory"
          value={formData.familyMedicalHistory || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Relevant family medical history"
          maxLength={300}
        />
        <small>{(formData.familyMedicalHistory || '').length}/300</small>
        {errors?.familyMedicalHistory && <span className="error">{errors.familyMedicalHistory}</span>}
      </div>
    </div>
  );
};

export default MedicalHistoryStep;
```

### InsuranceStep.jsx

```jsx
import React, { useState } from 'react';

const InsuranceStep = ({ data, onChange, errors = {}, doctors = [] }) => {
  const [formData, setFormData] = useState(data || {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = () => {
    onChange(formData);
  };

  return (
    <div className="step-container">
      <h2>Step 3: Insurance & Preferences</h2>

      <div className="form-group">
        <label>Insurance Provider *</label>
        <input
          type="text"
          name="insuranceProvider"
          value={formData.insuranceProvider || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="e.g., Blue Cross Blue Shield"
        />
        {errors?.insuranceProvider && <span className="error">{errors.insuranceProvider}</span>}
      </div>

      <div className="form-group">
        <label>Insurance ID *</label>
        <input
          type="text"
          name="insuranceId"
          value={formData.insuranceId || ''}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {errors?.insuranceId && <span className="error">{errors.insuranceId}</span>}
      </div>

      <div className="form-group">
        <label>Policy Holder Name *</label>
        <input
          type="text"
          name="policyHolderName"
          value={formData.policyHolderName || ''}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {errors?.policyHolderName && <span className="error">{errors.policyHolderName}</span>}
      </div>

      <div className="form-group">
        <label>Preferred Doctor *</label>
        <select
          name="preferredDoctorId"
          value={formData.preferredDoctorId || ''}
          onChange={handleChange}
          onBlur={handleBlur}
        >
          <option value="">Select a Doctor</option>
          {doctors.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.full_name} - {doc.specialization}
            </option>
          ))}
        </select>
        {errors?.preferredDoctorId && <span className="error">{errors.preferredDoctorId}</span>}
      </div>

      <div className="form-group">
        <label>Preferred Time Slot *</label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="preferredTimeSlot"
              value="morning"
              checked={formData.preferredTimeSlot === 'morning'}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            Morning
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="preferredTimeSlot"
              value="afternoon"
              checked={formData.preferredTimeSlot === 'afternoon'}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            Afternoon
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="preferredTimeSlot"
              value="evening"
              checked={formData.preferredTimeSlot === 'evening'}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            Evening
          </label>
        </div>
        {errors?.preferredTimeSlot && <span className="error">{errors.preferredTimeSlot}</span>}
      </div>

      <div className="form-group">
        <label>Referral Source</label>
        <select
          name="referralSource"
          value={formData.referralSource || ''}
          onChange={handleChange}
          onBlur={handleBlur}
        >
          <option value="">Select Source</option>
          <option value="google">Google</option>
          <option value="friend">Friend Referral</option>
          <option value="doctor_referral">Doctor Referral</option>
          <option value="ad">Advertisement</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label>Additional Notes (max 200 chars)</label>
        <textarea
          name="additionalNotes"
          value={formData.additionalNotes || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Any additional information"
          maxLength={200}
        />
        <small>{(formData.additionalNotes || '').length}/200</small>
      </div>
    </div>
  );
};

export default InsuranceStep;
```

### OnboardingSummary.jsx

```jsx
import React from 'react';

const OnboardingSummary = ({ data }) => {
  return (
    <div className="summary-container">
      <h2>Summary</h2>
      
      <div className="summary-section">
        <h3>Personal Information</h3>
        <p><strong>Name:</strong> {data.personalInfo?.fullName}</p>
        <p><strong>Date of Birth:</strong> {data.personalInfo?.dateOfBirth}</p>
        <p><strong>Gender:</strong> {data.personalInfo?.gender}</p>
        <p><strong>Phone:</strong> {data.personalInfo?.phoneNumber}</p>
        <p><strong>Emergency Contact:</strong> {data.personalInfo?.emergencyContactName}</p>
      </div>

      <div className="summary-section">
        <h3>Medical History</h3>
        <p><strong>Blood Type:</strong> {data.medicalHistory?.bloodType}</p>
        <p><strong>Allergies:</strong> {data.medicalHistory?.knownAllergies?.join(', ') || 'None'}</p>
        <p><strong>Conditions:</strong> {data.medicalHistory?.chronicConditions?.join(', ') || 'None'}</p>
      </div>

      <div className="summary-section">
        <h3>Insurance</h3>
        <p><strong>Provider:</strong> {data.insuranceDetails?.insuranceProvider}</p>
        <p><strong>Policy ID:</strong> {data.insuranceDetails?.insuranceId}</p>
        <p><strong>Time Preference:</strong> {data.insuranceDetails?.preferredTimeSlot}</p>
      </div>
    </div>
  );
};

export default OnboardingSummary;
```

---

## REAL-TIME CHAT

### ChatWindow.jsx

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './ChatWindow.css';

const ChatWindow = () => {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);

  const roomId = localStorage.getItem('chatRoomId');
  const doctorId = localStorage.getItem('doctorId');

  useEffect(() => {
    if (!socket || !connected) return;

    // Join chat room
    socket.emit('user:join', user.id);
    
    socket.emit('chat:join', {
      roomId,
      userId: user.id,
      otherUserId: doctorId,
    });

    // Listen for messages
    socket.on('chat:receive-message', (data) => {
      setMessages((prev) => [...prev, {
        id: Date.now(),
        senderId: data.userId,
        message: data.message,
        timestamp: data.timestamp,
        isOwn: data.userId === user.id,
      }]);
    });

    // Listen for user joined
    socket.on('chat:user-joined', () => {
      setOtherUserOnline(true);
    });

    // Listen for user left
    socket.on('chat:user-left', () => {
      setOtherUserOnline(false);
    });

    // Listen for typing
    socket.on('chat:typing-status', (data) => {
      setIsTyping(data.isTyping);
    });

    return () => {
      socket.emit('chat:leave', {
        roomId,
        userId: user.id,
      });
      socket.off('chat:receive-message');
      socket.off('chat:user-joined');
      socket.off('chat:user-left');
      socket.off('chat:typing-status');
    };
  }, [socket, connected, user.id, roomId, doctorId]);

  const handleSendMessage = (messageText) => {
    if (!socket) return;

    socket.emit('chat:send-message', {
      roomId,
      message: messageText,
      timestamp: new Date().toISOString(),
    });

    socket.emit('chat:stop-typing', {
      roomId,
      userId: user.id,
    });
  };

  const handleTyping = (isTypingNow) => {
    if (!socket) return;

    if (isTypingNow) {
      socket.emit('chat:typing', {
        roomId,
        userId: user.id,
      });
    } else {
      socket.emit('chat:stop-typing', {
        roomId,
        userId: user.id,
      });
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2>Chat with Doctor</h2>
        <span className={`status ${otherUserOnline ? 'online' : 'offline'}`}>
          {otherUserOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      <MessageList messages={messages} />

      {isTyping && <div className="typing-indicator">Doctor is typing...</div>}

      <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping} />
    </div>
  );
};

export default ChatWindow;
```

### MessageList.jsx

```jsx
import React, { useEffect, useRef } from 'react';

const MessageList = ({ messages }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="messages-container">
      {messages.length === 0 ? (
        <div className="no-messages">No messages yet. Start the conversation!</div>
      ) : (
        messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.isOwn ? 'own' : 'other'}`}>
            <div className="message-content">{msg.message}</div>
            <small className="message-time">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </small>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
```

### MessageInput.jsx

```jsx
import React, { useState } from 'react';

const MessageInput = ({ onSendMessage, onTyping }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);

    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      onTyping(true);
    } else if (isTyping && value.length === 0) {
      setIsTyping(false);
      onTyping(false);
    }
  };

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
      setIsTyping(false);
      onTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="message-input-container">
      <textarea
        value={input}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        rows="2"
      />
      <button onClick={handleSend} disabled={!input.trim()}>
        Send
      </button>
    </div>
  );
};

export default MessageInput;
```

---

## SOCKET.IO INTEGRATION

### hooks/useSocket.js

```jsx
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './useAuth';

export const useSocket = () => {
  const { token } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socketRef.current = socket;

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token]);

  return {
    socket: socketRef.current,
    connected,
  };
};
```

---

## COMPLETE APP SETUP

### App.jsx

```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import OnboardingForm from './components/Onboarding/OnboardingForm';
import PatientDashboard from './components/Dashboard/PatientDashboard';
import DoctorDashboard from './components/Dashboard/DoctorDashboard';
import ChatWindow from './components/Chat/ChatWindow';
import Navbar from './components/Common/Navbar';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Patient Routes */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requiredRole="patient">
                <OnboardingForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                {localStorage.getItem('role') === 'patient' ? (
                  <PatientDashboard />
                ) : (
                  <DoctorDashboard />
                )}
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute requiredRole="patient">
                <ChatWindow />
              </ProtectedRoute>
            }
          />

          {/* Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
```

### Signup.jsx

```jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Auth.css';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'patient',
  });
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.email || !formData.password || !formData.fullName) {
      setFormError('All fields are required');
      return;
    }

    try {
      await signup(
        formData.email,
        formData.password,
        formData.fullName,
        formData.role
      );
      localStorage.setItem('role', formData.role);
      
      if (formData.role === 'patient') {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setFormError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1>Create Account</h1>
        
        {(error || formError) && <div className="error-message">{error || formError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};

export default Signup;
```

### Login.jsx

```jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      const response = await login(email, password);
      localStorage.setItem('role', response.user.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1>Login</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
      </div>
    </div>
  );
};

export default Login;
```

### PatientDashboard.jsx

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ChatWindow from '../Chat/ChatWindow';
import './Dashboard.css';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await api.get('/patients/profile');
        setProfile(profileRes.data.profile);

        const doctorRes = await api.get('/patients/doctor');
        setDoctor(doctorRes.data.doctor);
      } catch (err) {
        if (err.response?.status === 404) {
          // Redirect to onboarding if profile not found
          navigate('/onboarding');
        } else {
          setError(err.response?.data?.error || 'Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-container">
      <h1>Patient Dashboard</h1>

      {!showChat ? (
        <div className="dashboard-content">
          <div className="profile-section">
            <h2>Your Profile</h2>
            {profile && (
              <>
                <div className="info-card">
                  <h3>Personal Information</h3>
                  <p><strong>Name:</strong> {profile.personal_info?.fullName}</p>
                  <p><strong>DOB:</strong> {profile.personal_info?.dateOfBirth}</p>
                  <p><strong>Phone:</strong> {profile.personal_info?.phoneNumber}</p>
                </div>

                <div className="info-card">
                  <h3>Medical Information</h3>
                  <p><strong>Blood Type:</strong> {profile.medical_history?.bloodType}</p>
                  <p><strong>Allergies:</strong> {profile.medical_history?.knownAllergies?.join(', ') || 'None'}</p>
                  <p><strong>Conditions:</strong> {profile.medical_history?.chronicConditions?.join(', ') || 'None'}</p>
                </div>
              </>
            )}
          </div>

          <div className="doctor-section">
            <h2>Your Doctor</h2>
            {doctor ? (
              <div className="doctor-card">
                <p><strong>Name:</strong> {doctor.full_name}</p>
                <p><strong>Email:</strong> {doctor.email}</p>
                <button onClick={() => setShowChat(true)} className="chat-button">
                  Start Chat
                </button>
              </div>
            ) : (
              <p>Doctor assignment pending...</p>
            )}
          </div>
        </div>
      ) : (
        <div className="chat-section">
          <button onClick={() => setShowChat(false)} className="back-button">
            ← Back to Dashboard
          </button>
          <ChatWindow />
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
```

### DoctorDashboard.jsx

```jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './Dashboard.css';

const DoctorDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get('/doctors/patients');
        setPatients(res.data.patients);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard-container">
      <h1>Doctor Dashboard</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="patients-list">
        <h2>Your Patients</h2>
        {patients.length === 0 ? (
          <p>No patients assigned yet</p>
        ) : (
          <div className="patients-grid">
            {patients.map((assignment) => (
              <div key={assignment.id} className="patient-card">
                <p><strong>{assignment.patient?.full_name}</strong></p>
                <p><strong>Email:</strong> {assignment.patient?.email}</p>
                <p><strong>Assigned:</strong> {new Date(assignment.assigned_at).toLocaleDateString()}</p>
                <button onClick={() => setSelectedPatient(assignment)}>
                  View Details & Chat
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPatient && (
        <div className="patient-details">
          <h2>Patient Details</h2>
          <button onClick={() => setSelectedPatient(null)}>Close</button>
          
          <div className="detail-card">
            <h3>Medical Information</h3>
            <p><strong>Blood Type:</strong> {selectedPatient.patient_profile?.medical_history?.bloodType}</p>
            <p><strong>Allergies:</strong> {selectedPatient.patient_profile?.medical_history?.knownAllergies?.join(', ') || 'None'}</p>
            <p><strong>Conditions:</strong> {selectedPatient.patient_profile?.medical_history?.chronicConditions?.join(', ') || 'None'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
```

---

## BASIC STYLING

### OnboardingForm.css

```css
.onboarding-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.onboarding-form {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.step-container {
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.step-container h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.error {
  color: #d32f2f;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-label input {
  width: auto;
  margin-right: 8px;
}

.radio-group {
  display: flex;
  gap: 20px;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-label input {
  width: auto;
  margin-right: 8px;
}

.submit-button {
  background-color: #1976d2;
  color: white;
  padding: 12px 30px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
  margin-top: 20px;
}

.submit-button:hover:not(:disabled) {
  background-color: #1565c0;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.summary-container {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 4px;
  margin: 20px 0;
}

.summary-section {
  margin-bottom: 20px;
}

.summary-section h3 {
  color: #1976d2;
  margin-bottom: 10px;
}

.error-message {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}
```

### ChatWindow.css

```css
.chat-window {
  display: flex;
  flex-direction: column;
  height: 600px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.chat-header {
  background-color: #1976d2;
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h2 {
  margin: 0;
}

.status {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.status.online {
  background-color: #4caf50;
}

.status.offline {
  background-color: #f44336;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f9f9f9;
}

.no-messages {
  text-align: center;
  color: #999;
  padding: 50px 20px;
}

.message {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.message.own {
  align-items: flex-end;
}

.message.other {
  align-items: flex-start;
}

.message-content {
  background-color: #1976d2;
  color: white;
  padding: 10px 15px;
  border-radius: 8px;
  max-width: 70%;
  word-wrap: break-word;
}

.message.other .message-content {
  background-color: #e0e0e0;
  color: black;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.typing-indicator {
  padding: 10px 20px;
  color: #999;
  font-size: 14px;
  font-style: italic;
}

.message-input-container {
  display: flex;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #ddd;
  background: white;
}

.message-input-container textarea {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
}

.message-input-container button {
  padding: 10px 20px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.message-input-container button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.message-input-container button:hover:not(:disabled) {
  background-color: #1565c0;
}
```

### Auth.css

```css
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

.auth-form {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 400px;
}

.auth-form h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 5px rgba(25, 118, 210, 0.3);
}

button[type="submit"] {
  width: 100%;
  padding: 12px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
}

button[type="submit"]:hover:not(:disabled) {
  background-color: #1565c0;
}

button[type="submit"]:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

.auth-form p {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.auth-form a {
  color: #1976d2;
  text-decoration: none;
}

.auth-form a:hover {
  text-decoration: underline;
}
```

---

## IMPLEMENTATION CHECKLIST

- [ ] Project created and dependencies installed
- [ ] `.env` file configured
- [ ] Folder structure created
- [ ] `AuthContext.jsx` and `useAuth` hook implemented
- [ ] `api.js` service layer created
- [ ] `ProtectedRoute.jsx` component created
- [ ] Login and Signup components implemented
- [ ] Onboarding form components (all 3 steps) implemented
- [ ] Chat components implemented
- [ ] `useSocket` hook created
- [ ] `App.jsx` routes configured
- [ ] CSS styling added
- [ ] Tested authentication flow
- [ ] Tested onboarding submission
- [ ] Tested real-time chat

---

## START HERE

```bash
# 1. Create app
npx create-react-app medigence-frontend
cd medigence-frontend

# 2. Install dependencies
npm install axios socket.io-client react-router-dom

# 3. Create .env
echo 'REACT_APP_API_URL=http://localhost:5000/api' >> .env
echo 'REACT_APP_SOCKET_URL=http://localhost:5000' >> .env

# 4. Create folder structure
mkdir -p src/{components/{Auth,Onboarding,Chat,Dashboard,Common},services,contexts,utils,hooks}

# 5. Start building components from this guide
npm start
```

Backend must be running on `http://localhost:5000` before starting frontend!
