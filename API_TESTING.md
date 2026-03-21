# API Testing Guide - Medigence Backend

## Complete API Reference with cURL Examples

### Prerequisites
- Server running on `http://localhost:5000`
- JWT tokens from login/signup
- Postman or cURL for testing

---

## AUTHENTICATION ENDPOINTS (Public)

### 1. Signup - Create New Account

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "SecurePass123!",
    "fullName": "John Doe",
    "role": "patient"
  }'
```

**Response (201 Created):**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "patient@example.com",
    "role": "patient"
  }
}
```

---

### 2. Login - Authenticate User

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "SecurePass123!"
  }'
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "patient@example.com",
    "fullName": "John Doe",
    "role": "patient"
  }
}
```

---

### 3. Refresh Token

```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## PATIENT ENDPOINTS (Protected - Role: patient)

### 1. Save Onboarding Draft - Step 1

```bash
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:5000/api/patients/onboarding/save-draft \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "step": 1,
    "data": {
      "fullName": "John Michael Smith",
      "dateOfBirth": "1990-01-15",
      "gender": "male",
      "phoneNumber": "1-234-567-8900",
      "emergencyContactName": "Jane Smith",
      "emergencyContactPhone": "1-234-567-8901"
    }
  }'
```

**Response (201 Created):**
```json
{
  "message": "Step 1 draft saved successfully",
  "draft": {
    "id": "9d6f0e23-5c69-4d4e-9f52-8e7b8c3a5b2d",
    "patient_id": "123e4567-e89b-12d3-a456-426614174000",
    "step": 1,
    "data": {
      "fullName": "John Michael Smith",
      "dateOfBirth": "1990-01-15",
      "gender": "male",
      "phoneNumber": "1-234-567-8900",
      "emergencyContactName": "Jane Smith",
      "emergencyContactPhone": "1-234-567-8901"
    },
    "created_at": "2024-03-21T10:00:00Z",
    "updated_at": "2024-03-21T10:00:00Z"
  }
}
```

---

### 2. Save Onboarding Draft - Step 2

```bash
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:5000/api/patients/onboarding/save-draft \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "step": 2,
    "data": {
      "bloodType": "O+",
      "currentMedications": "Lisinopril 10mg once daily, Metformin 500mg twice daily",
      "knownAllergies": ["penicillin", "shellfish"],
      "chronicConditions": ["diabetes", "hypertension"],
      "previousSurgeries": "Appendectomy in 2015",
      "familyMedicalHistory": "Father: Diabetes, Heart disease. Mother: Hypertension"
    }
  }'
```

---

### 3. Save Onboarding Draft - Step 3

```bash
TOKEN="your_jwt_token_here"
DOCTOR_ID="550e8400-e29b-41d4-a716-446655440000"

curl -X POST http://localhost:5000/api/patients/onboarding/save-draft \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"step\": 3,
    \"data\": {
      \"insuranceProvider\": \"Blue Cross Blue Shield\",
      \"insuranceId\": \"BC123456789\",
      \"policyHolderName\": \"John Michael Smith\",
      \"preferredDoctorId\": \"$DOCTOR_ID\",
      \"preferredTimeSlot\": \"morning\",
      \"referralSource\": \"friend\",
      \"additionalNotes\": \"Prefer appointments on weekdays\"
    }
  }"
```

---

### 4. Get All Saved Drafts

```bash
TOKEN="your_jwt_token_here"

curl -X GET http://localhost:5000/api/patients/onboarding/draft \
  -H "Authorization: Bearer $TOKEN"
```

**Response (200 OK):**
```json
{
  "drafts": [
    {
      "id": "draft-id-1",
      "patient_id": "patient-id",
      "step": 1,
      "data": { /* step 1 data */ },
      "created_at": "2024-03-21T10:00:00Z",
      "updated_at": "2024-03-21T10:00:00Z"
    },
    {
      "id": "draft-id-2",
      "patient_id": "patient-id",
      "step": 2,
      "data": { /* step 2 data */ },
      "created_at": "2024-03-21T10:05:00Z",
      "updated_at": "2024-03-21T10:05:00Z"
    }
  ],
  "lastCompletedStep": 2
}
```

---

### 5. Get Onboarding Progress

```bash
TOKEN="your_jwt_token_here"

curl -X GET http://localhost:5000/api/patients/onboarding/progress \
  -H "Authorization: Bearer $TOKEN"
```

**Response (200 OK):**
```json
{
  "completed": false,
  "completedAt": null,
  "savedSteps": [1, 2],
  "currentStep": 3
}
```

---

### 6. Submit Complete Onboarding

```bash
TOKEN="your_jwt_token_here"
DOCTOR_ID="550e8400-e29b-41d4-a716-446655440000"

curl -X POST http://localhost:5000/api/patients/onboarding/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"personalInfo\": {
      \"fullName\": \"John Michael Smith\",
      \"dateOfBirth\": \"1990-01-15\",
      \"gender\": \"male\",
      \"phoneNumber\": \"1-234-567-8900\",
      \"emergencyContactName\": \"Jane Smith\",
      \"emergencyContactPhone\": \"1-234-567-8901\"
    },
    \"medicalHistory\": {
      \"bloodType\": \"O+\",
      \"currentMedications\": \"Lisinopril 10mg once daily\",
      \"knownAllergies\": [\"penicillin\"],
      \"chronicConditions\": [\"diabetes\"],
      \"previousSurgeries\": \"Appendectomy in 2015\",
      \"familyMedicalHistory\": \"Father: Diabetes\"
    },
    \"insuranceDetails\": {
      \"insuranceProvider\": \"Blue Cross Blue Shield\",
      \"insuranceId\": \"BC123456789\",
      \"policyHolderName\": \"John Michael Smith\",
      \"preferredDoctorId\": \"$DOCTOR_ID\",
      \"preferredTimeSlot\": \"morning\",
      \"referralSource\": \"friend\",
      \"additionalNotes\": \"Prefer appointments on weekdays\"
    }
  }"
```

**Response (201 Created):**
```json
{
  "message": "Onboarding completed successfully!",
  "profile": {
    "id": "profile-id",
    "user_id": "patient-id",
    "personal_info": { /* all data */ },
    "medical_history": { /* all data */ },
    "insurance_details": { /* all data */ },
    "onboarding_completed": true,
    "completed_at": "2024-03-21T10:15:00Z"
  },
  "doctorId": "550e8400-e29b-41d4-a716-446655440000",
  "roomId": "patient-id-doctor-id"
}
```

---

### 7. Get Patient Profile

```bash
TOKEN="your_jwt_token_here"

curl -X GET http://localhost:5000/api/patients/profile \
  -H "Authorization: Bearer $TOKEN"
```

**Response (200 OK):**
```json
{
  "profile": {
    "id": "profile-id",
    "user_id": "patient-id",
    "personal_info": { /* parsed data */ },
    "medical_history": { /* parsed data */ },
    "insurance_details": { /* parsed data */ },
    "onboarding_completed": true,
    "completed_at": "2024-03-21T10:15:00Z"
  }
}
```

---

### 8. Get Assigned Doctor

```bash
TOKEN="your_jwt_token_here"

curl -X GET http://localhost:5000/api/patients/doctor \
  -H "Authorization: Bearer $TOKEN"
```

**Response (200 OK):**
```json
{
  "doctor": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "doctor@example.com",
    "full_name": "Dr. Sarah Johnson"
  },
  "assignedAt": "2024-03-21T10:15:00Z"
}
```

---

## DOCTOR ENDPOINTS (Protected - Role: doctor)

### 1. Get Assigned Patients

```bash
TOKEN="doctor_jwt_token_here"

curl -X GET http://localhost:5000/api/doctors/patients \
  -H "Authorization: Bearer $TOKEN"
```

**Response (200 OK):**
```json
{
  "patients": [
    {
      "id": "assignment-id",
      "patient_id": "patient-uuid",
      "doctor_id": "doctor-uuid",
      "assigned_at": "2024-03-21T10:15:00Z",
      "patient": {
        "id": "patient-uuid",
        "email": "patient@example.com",
        "full_name": "John Smith"
      },
      "patient_profile": {
        "id": "profile-id",
        "personal_info": { /* data */ },
        "medical_history": { /* data */ }
      }
    }
  ]
}
```

---

### 2. Get Specific Patient Details

```bash
TOKEN="doctor_jwt_token_here"
PATIENT_ID="123e4567-e89b-12d3-a456-426614174000"

curl -X GET http://localhost:5000/api/doctors/patients/$PATIENT_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Response (200 OK):**
```json
{
  "patient": {
    "id": "patient-uuid",
    "email": "patient@example.com",
    "full_name": "John Smith",
    "patient_profile": {
      "personal_info": { /* full data */ },
      "medical_history": { /* full data */ },
      "insurance_details": { /* full data */ }
    }
  }
}
```

---

### 3. Get Doctor Profile

```bash
TOKEN="doctor_jwt_token_here"

curl -X GET http://localhost:5000/api/doctors/profile \
  -H "Authorization: Bearer $TOKEN"
```

**Response (200 OK):**
```json
{
  "profile": {
    "id": "profile-id",
    "user_id": "doctor-uuid",
    "license_number": "MD123456",
    "specialization": "General Practice",
    "bio": "Experienced general practitioner...",
    "available_slots": 8
  }
}
```

---

## ERROR RESPONSES

### 400 Bad Request - Validation Error
```json
{
  "error": "Validation failed",
  "errors": {
    "personalInfo": {
      "fullName": "Full name must contain at least 2 words",
      "dateOfBirth": "Must be at least 18 years old"
    }
  }
}
```

### 401 Unauthorized - Missing/Invalid Token
```json
{
  "error": "Invalid or expired token"
}
```

### 403 Forbidden - Insufficient Permissions
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Profile not found"
}
```

### 409 Conflict - User Already Exists
```json
{
  "error": "User already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## COMMON TESTING WORKFLOW

```bash
#!/bin/bash

# 1. Create patient account
PATIENT_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "SecurePass123!",
    "fullName": "John Doe",
    "role": "patient"
  }')

PATIENT_TOKEN=$(echo $PATIENT_RESPONSE | jq -r '.token')
echo "Patient Token: $PATIENT_TOKEN"

# 2. Save step 1
curl -s -X POST http://localhost:5000/api/patients/onboarding/save-draft \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -d '{
    "step": 1,
    "data": {
      "fullName": "John Michael Smith",
      "dateOfBirth": "1990-01-15",
      "gender": "male",
      "phoneNumber": "1-234-567-8900",
      "emergencyContactName": "Jane Smith",
      "emergencyContactPhone": "1-234-567-8901"
    }
  }' | jq

# 3. Check progress
curl -s -X GET http://localhost:5000/api/patients/onboarding/progress \
  -H "Authorization: Bearer $PATIENT_TOKEN" | jq
```

---

## BASH SCRIPT FOR QUICK TESTING

Create a file `test-api.sh`:

```bash
#!/bin/bash

API="http://localhost:5000"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Medigence Backend API Testing ===${NC}\n"

# Signup
echo -e "${BLUE}1. Creating patient account...${NC}"
SIGNUP=$(curl -s -X POST $API/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test'$(date +%s)'@example.com",
    "password": "Test123!",
    "fullName": "Test Patient",
    "role": "patient"
  }')

TOKEN=$(echo $SIGNUP | jq -r '.token')
echo -e "${GREEN}Token: ${TOKEN:0:20}...${NC}\n"

# Save draft
echo -e "${BLUE}2. Saving onboarding draft...${NC}"
curl -s -X POST $API/api/patients/onboarding/save-draft \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "step": 1,
    "data": {
      "fullName": "Test Patient",
      "dateOfBirth": "1990-01-15",
      "gender": "male",
      "phoneNumber": "1234567890",
      "emergencyContactName": "Test Contact",
      "emergencyContactPhone": "1234567891"
    }
  }' | jq

echo -e "\n${GREEN}=== Tests Complete ===${NC}"
```

Run with: `bash test-api.sh`
