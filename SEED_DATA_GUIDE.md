# Seed Data Guide

Complete guide for database seeding and test data management.

---

## OVERVIEW

The `database/schema.sql` file now includes comprehensive seed data for development and testing:

- **4 Sample Patients** with complete onboarding data
- **3 Sample Doctors** with profiles
- **4 Doctor-Patient Assignments**
- **4 Chat Rooms**
- **4 Sample Chat Messages**

---

## TEST CREDENTIALS

All test accounts use password: `Test@123` (hashed as `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DxoWXe`)

### Patients

| Email | Name | ID | Blood Type | Conditions |
|-------|------|----|----|-----------|
| patient1@example.com | John Michael Smith | 660e8400...1 | O+ | Diabetes, Hypertension |
| patient2@example.com | Jane Elizabeth Baker | 660e8400...2 | A+ | Hypertension |
| patient3@example.com | Robert Davis | 660e8400...3 | B- | Heart Disease, Hypertension |
| patient4@example.com | Sarah Wilson | 660e8400...4 | AB+ | Asthma |

### Doctors

| Email | Name | ID | Specialization | Available Slots |
|-------|------|----|----|---------|
| dr.sarah@medigence.com | Dr. Sarah Johnson | 550e8400...1 | General Practice | 8 |
| dr.michael@medigence.com | Dr. Michael Chen | 550e8400...2 | Internal Medicine | 5 |
| dr.emily@medigence.com | Dr. Emily Rodriguez | 550e8400...3 | Cardiology | 3 |

---

## HOW TO USE

### Step 1: Run Schema with Seed Data

```bash
# In Supabase SQL Editor, copy entire schema.sql and run
# This includes both table creation and seed data
```

### Step 2: Test Authentication

```bash
# Login as Patient
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient1@example.com",
    "password": "Test@123"
  }'

# Login as Doctor
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dr.sarah@medigence.com",
    "password": "Test@123"
  }'
```

### Step 3: Test Patient Endpoints

```bash
TOKEN="your_jwt_token_from_login"

# Get patient profile
curl -X GET http://localhost:5000/api/patients/profile \
  -H "Authorization: Bearer $TOKEN"

# Get assigned doctor
curl -X GET http://localhost:5000/api/patients/doctor \
  -H "Authorization: Bearer $TOKEN"
```

### Step 4: Test Doctor Endpoints

```bash
TOKEN="doctor_jwt_token"

# Get assigned patients
curl -X GET http://localhost:5000/api/doctors/patients \
  -H "Authorization: Bearer $TOKEN"

# Get specific patient
curl -X GET http://localhost:5000/api/doctors/patients/660e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer $TOKEN"
```

---

## SEED DATA STRUCTURE

### Users Table

```sql
-- 4 patients + 3 doctors
-- Total: 7 users
-- All with hashed password: Test@123
```

### Patient Profiles

Each patient has complete onboarding data:

**Patient 1 - John Michael Smith**
- **Personal Info**: Full name, DOB: 1990-01-15, Male, Phone, Emergency contact
- **Medical History**: 
  - Blood Type: O+
  - Medications: Lisinopril, Metformin
  - Allergies: Penicillin, Shellfish
  - Conditions: Diabetes, Hypertension
  - Surgeries: Appendectomy 2015
- **Insurance**: Blue Cross Blue Shield
- **Assigned Doctor**: Dr. Sarah Johnson (General Practice)
- **Preferred Time**: Morning

**Patient 2 - Jane Elizabeth Baker**
- **Personal Info**: Full name, DOB: 1988-03-22, Female, Phone, Emergency contact
- **Medical History**:
  - Blood Type: A+
  - Medications: Atorvastatin
  - Allergies: Aspirin
  - Conditions: Hypertension
  - Surgeries: C-section 2010, Gallbladder 2018
- **Insurance**: Aetna
- **Assigned Doctor**: Dr. Michael Chen (Internal Medicine)
- **Preferred Time**: Afternoon

**Patient 3 - Robert Davis**
- **Personal Info**: Full name, DOB: 1975-07-10, Male, Phone, Emergency contact
- **Medical History**:
  - Blood Type: B-
  - Medications: Metoprolol, Aspirin
  - Allergies: Sulfa
  - Conditions: Heart Disease, Hypertension
  - Surgeries: Bypass 2010, Stent 2015
- **Insurance**: United Healthcare
- **Assigned Doctor**: Dr. Emily Rodriguez (Cardiology)
- **Preferred Time**: Morning

**Patient 4 - Sarah Wilson**
- **Personal Info**: Full name, DOB: 1995-11-05, Female, Phone, Emergency contact
- **Medical History**:
  - Blood Type: AB+
  - Medications: Albuterol inhaler
  - Allergies: Latex
  - Conditions: Asthma
  - No surgeries
- **Insurance**: Cigna
- **Assigned Doctor**: Dr. Sarah Johnson (General Practice)
- **Preferred Time**: Evening

### Doctor Profiles

```
Doctor 1 - Dr. Sarah Johnson
  License: MD123456
  Specialization: General Practice
  Slots: 8 available
  Bio: 15 years experience in general medicine
  Patients: John Smith, Sarah Wilson

Doctor 2 - Dr. Michael Chen
  License: MD123457
  Specialization: Internal Medicine
  Slots: 5 available
  Bio: Chronic disease management specialist
  Patients: Jane Baker

Doctor 3 - Dr. Emily Rodriguez
  License: MD123458
  Specialization: Cardiology
  Slots: 3 available
  Bio: Preventive cardiology specialist
  Patients: Robert Davis
```

### Chat Rooms & Messages

**Room 1**: John Smith ↔ Dr. Sarah Johnson
- Messages with conversation about headaches
- Shows read/unread status

**Room 2**: Jane Baker ↔ Dr. Michael Chen
- Empty (ready for testing)

**Room 3**: Robert Davis ↔ Dr. Emily Rodriguez
- Empty (ready for testing)

**Room 4**: Sarah Wilson ↔ Dr. Sarah Johnson
- Empty (ready for testing)

---

## GENERATING HASHED PASSWORDS

If you need to create seed data with different passwords, use Node.js:

```bash
# Install bcryptjs
npm install bcryptjs

# Create a file: hash-password.js
```

**hash-password.js:**
```javascript
const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
}

// Hash your password
hashPassword('YourPassword123!');
```

Run:
```bash
node hash-password.js
```

Then use the output hash in your seed data.

---

## CLEARING SEED DATA

To clear all seed data and start fresh:

```sql
-- Delete in order of dependencies
DELETE FROM chat_messages;
DELETE FROM chat_rooms;
DELETE FROM onboarding_drafts;
DELETE FROM patient_doctor_assignments;
DELETE FROM patient_profiles;
DELETE FROM doctor_profiles;
DELETE FROM users;

-- Verify all deleted
SELECT COUNT(*) FROM users;
```

Then re-run the INSERT statements from schema.sql.

---

## ADDING MORE TEST DATA

### Add a New Patient

```sql
-- 1. Add user
INSERT INTO users (id, email, password, full_name, role, created_at, updated_at) 
VALUES (
  'your-new-uuid',
  'newpatient@example.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DxoWXe',
  'New Patient Name',
  'patient',
  NOW(),
  NOW()
);

-- 2. Add profile
INSERT INTO patient_profiles (id, user_id, personal_info, medical_history, insurance_details, onboarding_completed, completed_at, created_at, updated_at)
VALUES (
  'your-profile-uuid',
  'your-new-uuid',
  '{"fullName": "New Patient Name", "dateOfBirth": "1990-01-01", "gender": "male", "phoneNumber": "1-555-999-9999", "emergencyContactName": "Emergency", "emergencyContactPhone": "1-555-999-9998"}'::jsonb,
  '{"bloodType": "O+", "currentMedications": "", "knownAllergies": [], "chronicConditions": [], "previousSurgeries": "", "familyMedicalHistory": ""}'::jsonb,
  '{"insuranceProvider": "Insurance Name", "insuranceId": "ID123", "policyHolderName": "Holder", "preferredDoctorId": "550e8400-e29b-41d4-a716-446655440001", "preferredTimeSlot": "morning", "referralSource": "other", "additionalNotes": ""}'::jsonb,
  true,
  NOW(),
  NOW(),
  NOW()
);

-- 3. Assign to doctor
INSERT INTO patient_doctor_assignments (id, patient_id, doctor_id, assigned_at)
VALUES (
  'your-assignment-uuid',
  'your-new-uuid',
  '550e8400-e29b-41d4-a716-446655440001',
  NOW()
);

-- 4. Create chat room
INSERT INTO chat_rooms (id, patient_id, doctor_id, created_at, updated_at)
VALUES (
  'your-new-uuid-550e8400-e29b-41d4-a716-446655440001',
  'your-new-uuid',
  '550e8400-e29b-41d4-a716-446655440001',
  NOW(),
  NOW()
);
```

### Add a New Doctor

```sql
-- 1. Add user
INSERT INTO users (id, email, password, full_name, role, created_at, updated_at)
VALUES (
  'your-new-doctor-uuid',
  'newdoctor@medigence.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DxoWXe',
  'Dr. New Doctor',
  'doctor',
  NOW(),
  NOW()
);

-- 2. Add profile
INSERT INTO doctor_profiles (id, user_id, license_number, specialization, bio, available_slots, created_at, updated_at)
VALUES (
  'your-new-profile-uuid',
  'your-new-doctor-uuid',
  'MD999999',
  'Specialty Name',
  'Doctor bio here',
  10,
  NOW(),
  NOW()
);
```

---

## TESTING WORKFLOWS

### Complete Patient Workflow

1. **Signup** → Get JWT token
2. **Verify Profile** → GET `/patients/profile`
3. **Get Doctor** → GET `/patients/doctor`
4. **Send Message** → Socket.io: `chat:send-message`
5. **Receive Message** → Socket.io: `chat:receive-message`

### Complete Doctor Workflow

1. **Login** → Get JWT token
2. **Get Patients** → GET `/doctors/patients` (should see 1+ patients)
3. **Get Patient Details** → GET `/doctors/patients/{patientId}`
4. **Send Message** → Socket.io: `chat:send-message`
5. **Receive Message** → Socket.io: `chat:receive-message`

---

## DATABASE QUERIES FOR VERIFICATION

```sql
-- Verify users created
SELECT id, email, full_name, role FROM users ORDER BY created_at DESC;

-- Verify patient profiles
SELECT u.full_name, pp.onboarding_completed, pp.completed_at 
FROM patient_profiles pp
JOIN users u ON pp.user_id = u.id;

-- Verify doctor profiles
SELECT u.full_name, dp.specialization, dp.available_slots
FROM doctor_profiles dp
JOIN users u ON dp.user_id = u.id;

-- Verify assignments
SELECT u1.full_name as patient, u2.full_name as doctor, pda.assigned_at
FROM patient_doctor_assignments pda
JOIN users u1 ON pda.patient_id = u1.id
JOIN users u2 ON pda.doctor_id = u2.id;

-- Verify chat messages
SELECT COUNT(*) as total_messages FROM chat_messages;

-- Get unread messages
SELECT sender_id, COUNT(*) as unread_count
FROM chat_messages
WHERE read = false
GROUP BY sender_id;
```

---

## IMPORTANT NOTES

1. **Password Hashing**: All test passwords use the same hash (Test@123) for simplicity in development
2. **UUIDs**: Use proper UUID format (e.g., using `gen_random_uuid()` in Supabase)
3. **Timestamps**: All created_at/updated_at use NOW() which is current server time
4. **Data Relationships**: Foreign keys properly link all data
5. **Production**: Never use seed data in production - this is for development only

---

## QUICK REFERENCE

```bash
# Test Patient Login
EMAIL=patient1@example.com
PASSWORD=Test@123
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}"

# Test Doctor Login
EMAIL=dr.sarah@medigence.com
PASSWORD=Test@123
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}"
```

That's it! Your database is pre-populated and ready for testing.
