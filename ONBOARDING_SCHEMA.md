# Onboarding Form Schema & Field Definitions

## Overview
The patient onboarding process consists of 3 steps with comprehensive field validation. Each step can be saved as a draft and resumed later.

---

## STEP 1: PERSONAL INFORMATION

### Fields and Validation

| Field | Type | Required | Validation Rules | Example |
|-------|------|----------|------------------|---------|
| **fullName** | Text | ✓ Yes | Min 2 words (first + last name), max 100 chars | "John Michael Smith" |
| **dateOfBirth** | Date | ✓ Yes | Valid date, must be 18+, max 150 years | "1990-01-15" |
| **gender** | Dropdown | ✓ Yes | Options: male, female, other, prefer_not_to_say | "male" |
| **phoneNumber** | Text | ✓ Yes | Valid phone format | "+1-234-567-8900" or "1234567890" |
| **emergencyContactName** | Text | ✓ Yes | Min 2 characters | "Jane Smith" |
| **emergencyContactPhone** | Text | ✓ Yes | Valid phone format | "1-234-567-8901" |

### Request Example
```json
{
  "step": 1,
  "data": {
    "fullName": "John Michael Smith",
    "dateOfBirth": "1990-01-15",
    "gender": "male",
    "phoneNumber": "+1-234-567-8900",
    "emergencyContactName": "Jane Smith",
    "emergencyContactPhone": "1-234-567-8901"
  }
}
```

### Response Example
```json
{
  "message": "Step 1 draft saved successfully",
  "draft": {
    "id": "uuid-here",
    "patient_id": "patient-uuid",
    "step": 1,
    "data": {
      "fullName": "John Michael Smith",
      "dateOfBirth": "1990-01-15",
      "gender": "male",
      "phoneNumber": "+1-234-567-8900",
      "emergencyContactName": "Jane Smith",
      "emergencyContactPhone": "1-234-567-8901"
    },
    "created_at": "2024-03-21T10:00:00Z",
    "updated_at": "2024-03-21T10:00:00Z"
  }
}
```

---

## STEP 2: MEDICAL HISTORY

### Fields and Validation

| Field | Type | Required | Validation Rules | Options |
|-------|------|----------|------------------|---------|
| **bloodType** | Dropdown | ✓ Yes | Single selection | A+, A-, B+, B-, O+, O-, AB+, AB-, unknown |
| **currentMedications** | Textarea | Optional | Max 500 characters | Free text |
| **knownAllergies** | Multi-select | Optional | Array of selections | penicillin, aspirin, sulfa, latex, shellfish, none, other |
| **chronicConditions** | Checkboxes | Optional | Array of selections | diabetes, hypertension, asthma, heart_disease, arthritis, none |
| **previousSurgeries** | Textarea | Optional | No length limit | Free text |
| **familyMedicalHistory** | Textarea | Optional | Max 300 characters | Free text |

### Request Example
```json
{
  "step": 2,
  "data": {
    "bloodType": "O+",
    "currentMedications": "Lisinopril 10mg once daily, Metformin 500mg twice daily",
    "knownAllergies": ["penicillin", "shellfish"],
    "chronicConditions": ["diabetes", "hypertension"],
    "previousSurgeries": "Appendectomy in 2015",
    "familyMedicalHistory": "Father: Diabetes, Heart disease. Mother: Hypertension"
  }
}
```

### Response Example
```json
{
  "message": "Step 2 draft saved successfully",
  "draft": {
    "id": "uuid-here",
    "patient_id": "patient-uuid",
    "step": 2,
    "data": {
      "bloodType": "O+",
      "currentMedications": "Lisinopril 10mg once daily, Metformin 500mg twice daily",
      "knownAllergies": ["penicillin", "shellfish"],
      "chronicConditions": ["diabetes", "hypertension"],
      "previousSurgeries": "Appendectomy in 2015",
      "familyMedicalHistory": "Father: Diabetes, Heart disease. Mother: Hypertension"
    },
    "created_at": "2024-03-21T10:05:00Z",
    "updated_at": "2024-03-21T10:05:00Z"
  }
}
```

---

## STEP 3: INSURANCE & PREFERENCES

### Fields and Validation

| Field | Type | Required | Validation Rules | Example |
|-------|------|----------|------------------|---------|
| **insuranceProvider** | Text | ✓ Yes | Min 2 characters | "Blue Cross Blue Shield" |
| **insuranceId** | Text | ✓ Yes | Min 3 characters | "BC123456789" |
| **policyHolderName** | Text | ✓ Yes | Min 2 characters | "John Michael Smith" |
| **preferredDoctorId** | UUID | ✓ Yes | Valid doctor UUID from database | "doc-uuid-12345" |
| **preferredTimeSlot** | Radio | ✓ Yes | morning, afternoon, evening | "morning" |
| **referralSource** | Dropdown | Optional | google, friend, doctor_referral, ad, other | "friend" |
| **additionalNotes** | Textarea | Optional | Max 200 characters | "Prefer Dr. Smith if available" |

### Request Example
```json
{
  "step": 3,
  "data": {
    "insuranceProvider": "Blue Cross Blue Shield",
    "insuranceId": "BC123456789",
    "policyHolderName": "John Michael Smith",
    "preferredDoctorId": "550e8400-e29b-41d4-a716-446655440000",
    "preferredTimeSlot": "morning",
    "referralSource": "friend",
    "additionalNotes": "Prefer appointments on weekdays if possible"
  }
}
```

### Response Example
```json
{
  "message": "Step 3 draft saved successfully",
  "draft": {
    "id": "uuid-here",
    "patient_id": "patient-uuid",
    "step": 3,
    "data": {
      "insuranceProvider": "Blue Cross Blue Shield",
      "insuranceId": "BC123456789",
      "policyHolderName": "John Michael Smith",
      "preferredDoctorId": "550e8400-e29b-41d4-a716-446655440000",
      "preferredTimeSlot": "morning",
      "referralSource": "friend",
      "additionalNotes": "Prefer appointments on weekdays if possible"
    },
    "created_at": "2024-03-21T10:10:00Z",
    "updated_at": "2024-03-21T10:10:00Z"
  }
}
```

---

## API ENDPOINTS

### 1. Save Draft (Any Step)
```
POST /api/patients/onboarding/save-draft
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "step": 1,
  "data": { /* field data */ }
}
```

**Response:** 201 Created or 400 Bad Request (validation errors)

---

### 2. Get All Drafts
```
GET /api/patients/onboarding/draft
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "drafts": [
    { "step": 1, "data": {...}, "updated_at": "..." },
    { "step": 2, "data": {...}, "updated_at": "..." }
  ],
  "lastCompletedStep": 2
}
```

---

### 3. Get Onboarding Progress
```
GET /api/patients/onboarding/progress
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "completed": false,
  "completedAt": null,
  "savedSteps": [1, 2],
  "currentStep": 3
}
```

---

### 4. Submit Complete Onboarding
```
POST /api/patients/onboarding/submit
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "personalInfo": { /* all step 1 fields */ },
  "medicalHistory": { /* all step 2 fields */ },
  "insuranceDetails": { /* all step 3 fields */ }
}
```

**Response:** 201 Created
```json
{
  "message": "Onboarding completed successfully!",
  "profile": {
    "id": "uuid",
    "user_id": "patient-uuid",
    "personal_info": { /* parsed data */ },
    "medical_history": { /* parsed data */ },
    "insurance_details": { /* parsed data */ },
    "onboarding_completed": true,
    "completed_at": "2024-03-21T10:15:00Z"
  },
  "doctorId": "doc-uuid",
  "roomId": "patient-uuid-doc-uuid"
}
```

---

## VALIDATION ERROR HANDLING

### Example Validation Error Response (400 Bad Request)
```json
{
  "error": "Validation failed",
  "errors": {
    "personalInfo": {
      "fullName": "Full name must contain at least 2 words",
      "dateOfBirth": "Must be at least 18 years old"
    },
    "medicalHistory": {
      "bloodType": "Valid blood type is required"
    }
  }
}
```

---

## DATA TYPE REQUIREMENTS

### Date Format
- ISO 8601: `YYYY-MM-DD` (e.g., `1990-01-15`)
- Must calculate age at submission time
- 18+ age validation required

### Phone Format (Accepted Variations)
- `+1-234-567-8900`
- `1-234-567-8900`
- `(123) 456-7890`
- `1234567890`
- `123-456-7890`
- Min 10 digits

### Enum Values (Case Insensitive)

**Gender:**
- `male`
- `female`
- `other`
- `prefer_not_to_say`

**Blood Type:**
- `A+`, `A-`, `B+`, `B-`, `O+`, `O-`, `AB+`, `AB-`, `unknown`

**Known Allergies (Multi-select):**
- `penicillin`
- `aspirin`
- `sulfa`
- `latex`
- `shellfish`
- `none`
- `other`

**Chronic Conditions (Checkboxes):**
- `diabetes`
- `hypertension`
- `asthma`
- `heart_disease`
- `arthritis`
- `none`

**Time Slots:**
- `morning`
- `afternoon`
- `evening`

**Referral Sources:**
- `google`
- `friend`
- `doctor_referral`
- `ad`
- `other`

---

## FRONTEND IMPLEMENTATION TIPS

1. **Progressive Save**: Save each step immediately after user completes it
2. **Resume Functionality**: Load saved drafts on page load and continue where user left off
3. **Progress Tracking**: Show which steps are completed
4. **Summary View**: Before final submission, show all entered data for review
5. **Error Display**: Show field-level validation errors inline
6. **Character Counters**: Display for Textarea fields with limits (medical history, family history, notes)
7. **Date Picker**: Use calendar widget and validate age automatically

---

## SEQUENCE FLOW

```
1. User starts onboarding
   ↓
2. System checks if drafts exist (GET /onboarding/draft)
   ├─ If yes → Load draft and show resume option
   └─ If no → Start fresh
   ↓
3. User completes Step 1 → POST /onboarding/save-draft (step: 1)
   ↓
4. User completes Step 2 → POST /onboarding/save-draft (step: 2)
   ↓
5. User completes Step 3 → POST /onboarding/save-draft (step: 3)
   ↓
6. User reviews summary (GET /onboarding/draft to show all data)
   ↓
7. User confirms submission → POST /onboarding/submit (all 3 steps)
   ↓
8. System returns doctorId and chat roomId
   ↓
9. User is assigned to doctor and chat room is created
```

---

## CHAT INTEGRATION

After onboarding submission, the response includes:
- `doctorId`: Use this to connect to the assigned doctor
- `roomId`: Use this for all chat communications

Example Socket.io connection:
```javascript
socket.emit('chat:join', {
  roomId: response.roomId,
  userId: currentPatientId,
  otherUserId: response.doctorId
});
```
