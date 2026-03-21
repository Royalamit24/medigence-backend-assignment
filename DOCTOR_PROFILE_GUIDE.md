# Doctor Profile Setup Guide

Complete guide for frontend developers to implement doctor profile creation/update flow after signup.

---

## OVERVIEW

When a doctor signs up, they need to:
1. **Sign up** → Create user account with role='doctor'
2. **Create Profile** → Add professional credentials, specialization, etc.
3. **Complete Setup** → Doctor can now view assigned patients

---

## DATABASE SCHEMA - Doctor Profiles

```sql
CREATE TABLE doctor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id),
  license_number VARCHAR(100) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  bio TEXT,
  available_slots INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Fields:**
- `license_number`: Medical license number (required)
- `specialization`: Medical specialty (required)
- `bio`: Professional biography (optional)
- `available_slots`: Available appointment slots (optional, defaults to 0)

---

## STEP 1: Doctor Signup

### Frontend Form

```javascript
// DoctorSignup.jsx
import { useState } from 'react';
import axios from 'axios';

export default function DoctorSignup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/auth/signup', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: 'doctor'  // IMPORTANT: Set role as 'doctor'
      });

      // Save token
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.user.id);
      localStorage.setItem('userRole', response.data.user.role);

      // Redirect to profile setup
      window.location.href = '/doctor/setup-profile';
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>Doctor Signup</h2>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}
```

---

## STEP 2: Doctor Profile Setup (After Signup)

### Frontend Form

```javascript
// DoctorProfileSetup.jsx
import { useState } from 'react';
import axios from 'axios';

export default function DoctorProfileSetup() {
  const [formData, setFormData] = useState({
    licenseNumber: '',
    specialization: '',
    bio: '',
    availableSlots: 5
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');

  const specializations = [
    'General Practice',
    'Internal Medicine',
    'Cardiology',
    'Dermatology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Surgery',
    'Oncology',
    'Ophthalmology',
    'ENT',
    'Gynecology',
    'Urology',
    'Rheumatology'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'availableSlots' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate
    if (!formData.licenseNumber.trim()) {
      setError('License number is required');
      return;
    }
    if (!formData.specialization.trim()) {
      setError('Specialization is required');
      return;
    }
    if (formData.availableSlots < 0) {
      setError('Available slots must be 0 or more');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        'http://localhost:5000/api/doctors/profile',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess('Profile created successfully! Redirecting...');
      setTimeout(() => {
        window.location.href = '/doctor/dashboard';
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto' }}>
      <h2>Complete Your Doctor Profile</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Medical License Number *</label>
          <input
            type="text"
            name="licenseNumber"
            placeholder="e.g., MD123456"
            value={formData.licenseNumber}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Specialization *</label>
          <select
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="">Select Specialization</option>
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Professional Bio (Optional)</label>
          <textarea
            name="bio"
            placeholder="Tell patients about your experience, qualifications, etc."
            value={formData.bio}
            onChange={handleChange}
            rows="4"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Available Appointment Slots</label>
          <input
            type="number"
            name="availableSlots"
            min="0"
            value={formData.availableSlots}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
        {success && <p style={{ color: 'green', marginBottom: '10px' }}>{success}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creating Profile...' : 'Create Profile'}
        </button>
      </form>
    </div>
  );
}
```

---

## STEP 3: Backend Endpoint (Doctor Profile Creation)

### Create New Endpoint

Create file: `src/routes/doctorRoutes.js` - Add new endpoint:

```javascript
// Add this route to existing doctorRoutes.js
router.post('/profile', authenticateToken, authorizeRole(['doctor']), createDoctorProfile);
```

### Create Controller Function

Add to `src/controllers/doctorController.js`:

```javascript
const createDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { licenseNumber, specialization, bio, availableSlots } = req.body;

    // Validate input
    if (!licenseNumber || !specialization) {
      return res.status(400).json({
        error: 'License number and specialization are required'
      });
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('doctor_profiles')
      .select('id')
      .eq('user_id', doctorId)
      .single();

    if (existingProfile) {
      return res.status(409).json({
        error: 'Profile already exists. Use update endpoint instead.'
      });
    }

    // Create profile
    const { data: profile, error } = await supabase
      .from('doctor_profiles')
      .insert({
        user_id: doctorId,
        license_number: licenseNumber,
        specialization,
        bio: bio || null,
        available_slots: availableSlots || 0,
        created_at: new Date(),
        updated_at: new Date()
      })
      .select()
      .single();

    if (error) {
      console.error('Profile creation error:', error);
      return res.status(500).json({ error: 'Failed to create profile' });
    }

    res.status(201).json({
      message: 'Doctor profile created successfully',
      profile
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ADD to exports
module.exports = {
  getAssignedPatients,
  getPatientDetails,
  getProfile,
  createDoctorProfile  // NEW
};
```

---

## STEP 4: Update Doctor Profile

### Frontend Update Form

```javascript
// DoctorProfileUpdate.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function DoctorProfileUpdate() {
  const [formData, setFormData] = useState({
    licenseNumber: '',
    specialization: '',
    bio: '',
    availableSlots: 5
  });
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/doctors/profile',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setFormData({
        licenseNumber: response.data.profile.license_number,
        specialization: response.data.profile.specialization,
        bio: response.data.profile.bio || '',
        availableSlots: response.data.profile.available_slots
      });
    } catch (err) {
      setError('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'availableSlots' ? parseInt(value) : value
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setSaveLoading(true);
      await axios.put(
        'http://localhost:5000/api/doctors/profile',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto' }}>
      <h2>Update Doctor Profile</h2>
      <form onSubmit={handleUpdate}>
        {/* Same form fields as setup */}
        <button type="submit" disabled={saveLoading}>
          {saveLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
```

### Backend Update Endpoint

Add to `src/controllers/doctorController.js`:

```javascript
const updateDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { licenseNumber, specialization, bio, availableSlots } = req.body;

    const { data: profile, error } = await supabase
      .from('doctor_profiles')
      .update({
        license_number: licenseNumber,
        specialization,
        bio,
        available_slots: availableSlots,
        updated_at: new Date()
      })
      .eq('user_id', doctorId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    res.json({
      message: 'Profile updated successfully',
      profile
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

Add route:
```javascript
router.put('/profile', authenticateToken, authorizeRole(['doctor']), updateDoctorProfile);
```

---

## FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────┐
│ Doctor Opens App                                    │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Login / Signup                                      │
│ - Enter email, password, full name                  │
│ - Select role: 'doctor'                             │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ POST /api/auth/signup                               │
│ - Creates user account                              │
│ - Returns JWT token                                 │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Check if Profile Exists                             │
│ - GET /api/doctors/profile (may return 404)         │
└────────────────┬────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
    EXISTS            NOT EXISTS
        │                 │
        │                 ▼
        │         ┌──────────────────────────────────┐
        │         │ Redirect to Profile Setup Page   │
        │         └────────────────┬─────────────────┘
        │                          │
        │                          ▼
        │         ┌──────────────────────────────────┐
        │         │ DoctorProfileSetup Component     │
        │         │ - License number                 │
        │         │ - Specialization (dropdown)      │
        │         │ - Bio (optional)                 │
        │         │ - Available slots                │
        │         └────────────────┬─────────────────┘
        │                          │
        │                          ▼
        │         ┌──────────────────────────────────┐
        │         │ POST /api/doctors/profile        │
        │         │ - Creates doctor_profiles entry  │
        │         └────────────────┬─────────────────┘
        │                          │
        └──────────────┬───────────┘
                       │
                       ▼
        ┌──────────────────────────────────┐
        │ Redirect to Doctor Dashboard     │
        │ - View assigned patients         │
        │ - Send/receive messages          │
        └──────────────────────────────────┘
```

---

## EXAMPLE: Complete Doctor Signup Flow

```bash
# 1. SIGNUP as doctor
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Dr. John Doe",
    "email": "dr.john@example.com",
    "password": "SecurePass123!",
    "role": "doctor"
  }'

# Response:
# {
#   "message": "User created successfully",
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": {
#     "id": "a7c5297c-a6fb-4868-8b8b-898103384c9e",
#     "email": "dr.john@example.com",
#     "role": "doctor"
#   }
# }

# Save the token:
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 2. CREATE DOCTOR PROFILE
curl -X POST http://localhost:5000/api/doctors/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "licenseNumber": "MD123456",
    "specialization": "Cardiology",
    "bio": "Board-certified cardiologist with 10 years of experience",
    "availableSlots": 15
  }'

# Response:
# {
#   "message": "Doctor profile created successfully",
#   "profile": {
#     "id": "doctor-profile-id",
#     "user_id": "a7c5297c-...",
#     "license_number": "MD123456",
#     "specialization": "Cardiology",
#     "bio": "Board-certified...",
#     "available_slots": 15
#   }
# }

# 3. GET PROFILE
curl -X GET http://localhost:5000/api/doctors/profile \
  -H "Authorization: Bearer $TOKEN"

# 4. VIEW ASSIGNED PATIENTS
curl -X GET http://localhost:5000/api/doctors/patients \
  -H "Authorization: Bearer $TOKEN"
```

---

## KEY POINTS

✅ **Must send role: 'doctor'** during signup
✅ **License number required** for profile creation
✅ **Specialization required** for profile
✅ **UUID validation** for doctor ID (backend enforces)
✅ **Token stored in localStorage** for authenticated requests
✅ **Redirect after profile creation** to prevent incomplete setup

---

## TESTING

Use these credentials:

```bash
# Seed doctor (already has profile)
Email: dr.sarah@medigence.com
Password: Test@123

# To test signup + profile creation:
1. Create new doctor account
2. Get JWT token from signup response
3. Use token to create profile
4. View patients assigned
```

That's it! Doctor profile setup is now complete 🎯
