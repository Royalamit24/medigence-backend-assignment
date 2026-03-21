-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('patient', 'doctor')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Patient profiles
CREATE TABLE patient_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  personal_info JSONB,
  medical_history JSONB,
  insurance_details JSONB,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Doctor profiles
CREATE TABLE doctor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  license_number VARCHAR(255),
  specialization VARCHAR(255),
  bio TEXT,
  available_slots INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Patient-Doctor assignments
CREATE TABLE patient_doctor_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(patient_id, doctor_id)
);

-- Onboarding drafts
CREATE TABLE onboarding_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  step INTEGER NOT NULL,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Chat messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id VARCHAR(255) NOT NULL,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chat rooms (for tracking active conversations)
CREATE TABLE chat_rooms (
  id VARCHAR(255) PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(patient_id, doctor_id)
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_patient_profiles_user_id ON patient_profiles(user_id);
CREATE INDEX idx_doctor_profiles_user_id ON doctor_profiles(user_id);
CREATE INDEX idx_assignments_doctor_id ON patient_doctor_assignments(doctor_id);
CREATE INDEX idx_assignments_patient_id ON patient_doctor_assignments(patient_id);
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- Indexes for searching unread messages
CREATE INDEX idx_chat_messages_unread ON chat_messages(read, receiver_id);

-- ============================================
-- SEED DATA FOR DEVELOPMENT & TESTING
-- ============================================

-- Note: Passwords are hashed with bcrypt (generated via Node.js)
-- Password: Test@123 = $2a$10$YourHashedPasswordHere
-- For development: Use the exact hashes below or generate new ones

-- Insert sample doctors
INSERT INTO users (id, email, password, full_name, role, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'dr.sarah@medigence.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DxoWXe', 'Dr. Sarah Johnson', 'doctor', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'dr.michael@medigence.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DxoWXe', 'Dr. Michael Chen', 'doctor', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'dr.emily@medigence.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DxoWXe', 'Dr. Emily Rodriguez', 'doctor', NOW(), NOW());

-- Insert sample patients
INSERT INTO users (id, email, password, full_name, role, created_at, updated_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'patient1@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DxoWXe', 'John Michael Smith', 'patient', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440002', 'patient2@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DxoWXe', 'Jane Elizabeth Baker', 'patient', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440003', 'patient3@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DxoWXe', 'Robert Davis', 'patient', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440004', 'patient4@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DxoWXe', 'Sarah Wilson', 'patient', NOW(), NOW());

-- Insert doctor profiles
INSERT INTO doctor_profiles (id, user_id, license_number, specialization, bio, available_slots, created_at, updated_at) VALUES
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'MD123456', 'General Practice', 'Experienced GP with 15 years in general medicine and patient care', 8, NOW(), NOW()),
('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'MD123457', 'Internal Medicine', 'Specialist in internal medicine with focus on chronic disease management', 5, NOW(), NOW()),
('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'MD123458', 'Cardiology', 'Board-certified cardiologist specializing in preventive cardiology', 3, NOW(), NOW());

-- Insert complete patient profiles with onboarding data
INSERT INTO patient_profiles (id, user_id, personal_info, medical_history, insurance_details, onboarding_completed, completed_at, created_at, updated_at) VALUES
(
  '850e8400-e29b-41d4-a716-446655440001',
  '660e8400-e29b-41d4-a716-446655440001',
  '{"fullName": "John Michael Smith", "dateOfBirth": "1990-01-15", "gender": "male", "phoneNumber": "1-555-123-4567", "emergencyContactName": "Jane Smith", "emergencyContactPhone": "1-555-123-4568"}'::jsonb,
  '{"bloodType": "O+", "currentMedications": "Lisinopril 10mg once daily, Metformin 500mg twice daily", "knownAllergies": ["penicillin", "shellfish"], "chronicConditions": ["diabetes", "hypertension"], "previousSurgeries": "Appendectomy in 2015", "familyMedicalHistory": "Father: Diabetes, Heart disease. Mother: Hypertension"}'::jsonb,
  '{"insuranceProvider": "Blue Cross Blue Shield", "insuranceId": "BC123456789", "policyHolderName": "John Michael Smith", "preferredDoctorId": "550e8400-e29b-41d4-a716-446655440001", "preferredTimeSlot": "morning", "referralSource": "friend", "additionalNotes": "Prefer appointments on weekdays"}'::jsonb,
  true,
  NOW(),
  NOW(),
  NOW()
),
(
  '850e8400-e29b-41d4-a716-446655440002',
  '660e8400-e29b-41d4-a716-446655440002',
  '{"fullName": "Jane Elizabeth Baker", "dateOfBirth": "1988-03-22", "gender": "female", "phoneNumber": "1-555-234-5678", "emergencyContactName": "Tom Baker", "emergencyContactPhone": "1-555-234-5679"}'::jsonb,
  '{"bloodType": "A+", "currentMedications": "Atorvastatin 20mg once daily", "knownAllergies": ["aspirin"], "chronicConditions": ["hypertension"], "previousSurgeries": "C-section in 2010, Gallbladder removal in 2018", "familyMedicalHistory": "Mother: Diabetes, Hypertension. Sister: Breast cancer"}'::jsonb,
  '{"insuranceProvider": "Aetna", "insuranceId": "AE987654321", "policyHolderName": "Jane Elizabeth Baker", "preferredDoctorId": "550e8400-e29b-41d4-a716-446655440002", "preferredTimeSlot": "afternoon", "referralSource": "google", "additionalNotes": "Evening appointments preferred"}'::jsonb,
  true,
  NOW(),
  NOW(),
  NOW()
),
(
  '850e8400-e29b-41d4-a716-446655440003',
  '660e8400-e29b-41d4-a716-446655440003',
  '{"fullName": "Robert Davis", "dateOfBirth": "1975-07-10", "gender": "male", "phoneNumber": "1-555-345-6789", "emergencyContactName": "Mary Davis", "emergencyContactPhone": "1-555-345-6790"}'::jsonb,
  '{"bloodType": "B-", "currentMedications": "Metoprolol 50mg twice daily, Aspirin 81mg once daily", "knownAllergies": ["sulfa"], "chronicConditions": ["heart_disease", "hypertension"], "previousSurgeries": "Bypass surgery 2010, Stent placement 2015", "familyMedicalHistory": "Father: Heart attack at 55. Grandfather: Stroke"}'::jsonb,
  '{"insuranceProvider": "United Healthcare", "insuranceId": "UH555666777", "policyHolderName": "Robert Davis", "preferredDoctorId": "550e8400-e29b-41d4-a716-446655440003", "preferredTimeSlot": "morning", "referralSource": "doctor_referral", "additionalNotes": "Cardiologist referred"}'::jsonb,
  true,
  NOW(),
  NOW(),
  NOW()
),
(
  '850e8400-e29b-41d4-a716-446655440004',
  '660e8400-e29b-41d4-a716-446655440004',
  '{"fullName": "Sarah Wilson", "dateOfBirth": "1995-11-05", "gender": "female", "phoneNumber": "1-555-456-7890", "emergencyContactName": "Mark Wilson", "emergencyContactPhone": "1-555-456-7891"}'::jsonb,
  '{"bloodType": "AB+", "currentMedications": "Albuterol inhaler as needed", "knownAllergies": ["latex"], "chronicConditions": ["asthma"], "previousSurgeries": "", "familyMedicalHistory": "Mother: Asthma. Father: No chronic conditions"}'::jsonb,
  '{"insuranceProvider": "Cigna", "insuranceId": "CG888999000", "policyHolderName": "Sarah Wilson", "preferredDoctorId": "550e8400-e29b-41d4-a716-446655440001", "preferredTimeSlot": "evening", "referralSource": "friend", "additionalNotes": "College student, flexible schedule"}'::jsonb,
  true,
  NOW(),
  NOW(),
  NOW()
);

-- Insert patient-doctor assignments
INSERT INTO patient_doctor_assignments (id, patient_id, doctor_id, assigned_at) VALUES
('950e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', NOW()),
('950e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', NOW()),
('950e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', NOW()),
('950e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', NOW());

-- Insert chat rooms
INSERT INTO chat_rooms (id, patient_id, doctor_id, created_at, updated_at) VALUES
('660e8400-e29b-41d4-a716-446655440001-550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440002-550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440003-550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440004-550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW());

-- Insert sample chat messages
INSERT INTO chat_messages (id, room_id, sender_id, receiver_id, message, read, created_at) VALUES
('a50e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001-550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Hi Doctor, I have been experiencing frequent headaches', false, NOW() - INTERVAL '2 hours'),
('a50e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001-550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Hello John, thank you for reaching out. Can you tell me more about when these headaches occur?', true, NOW() - INTERVAL '1.5 hours'),
('a50e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001-550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Usually in the afternoon, around 2-3 PM. They last about 30 minutes', true, NOW() - INTERVAL '1 hour'),
('a50e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001-550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'I see. This could be related to your blood pressure. Have you been monitoring it regularly?', false, NOW() - INTERVAL '45 minutes');

-- ============================================
-- TEST CREDENTIALS (for manual testing)
-- ============================================
-- Patient 1:
--   Email: patient1@example.com
--   Password: Test@123
--   ID: 660e8400-e29b-41d4-a716-446655440001
--
-- Patient 2:
--   Email: patient2@example.com
--   Password: Test@123
--   ID: 660e8400-e29b-41d4-a716-446655440002
--
-- Patient 3:
--   Email: patient3@example.com
--   Password: Test@123
--   ID: 660e8400-e29b-41d4-a716-446655440003
--
-- Patient 4:
--   Email: patient4@example.com
--   Password: Test@123
--   ID: 660e8400-e29b-41d4-a716-446655440004
--
-- Doctor 1 (Dr. Sarah Johnson):
--   Email: dr.sarah@medigence.com
--   Password: Test@123
--   ID: 550e8400-e29b-41d4-a716-446655440001
--
-- Doctor 2 (Dr. Michael Chen):
--   Email: dr.michael@medigence.com
--   Password: Test@123
--   ID: 550e8400-e29b-41d4-a716-446655440002
--
-- Doctor 3 (Dr. Emily Rodriguez):
--   Email: dr.emily@medigence.com
--   Password: Test@123
--   ID: 550e8400-e29b-41d4-a716-446655440003
--
-- ============================================
