// Comprehensive Onboarding Validators

// STEP 1: PERSONAL INFORMATION
const validatePersonalInfo = (data) => {
  const errors = {};

  // Full Name - Required, min 2 words
  if (!data.fullName || typeof data.fullName !== 'string') {
    errors.fullName = 'Full name is required';
  } else {
    const nameParts = data.fullName.trim().split(/\s+/);
    if (nameParts.length < 2) {
      errors.fullName = 'Full name must contain at least 2 words';
    }
    if (data.fullName.length > 100) {
      errors.fullName = 'Full name cannot exceed 100 characters';
    }
  }

  // Date of Birth - Required, 18+ years
  if (!data.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required';
  } else if (!isValidDate(data.dateOfBirth)) {
    errors.dateOfBirth = 'Invalid date format';
  } else {
    const age = calculateAge(new Date(data.dateOfBirth));
    if (age < 18) {
      errors.dateOfBirth = 'Must be at least 18 years old';
    }
    if (age > 150) {
      errors.dateOfBirth = 'Invalid date of birth';
    }
  }

  // Gender - Required, valid options
  const validGenders = ['male', 'female', 'other', 'prefer_not_to_say'];
  if (!data.gender || !validGenders.includes(data.gender.toLowerCase())) {
    errors.gender = 'Valid gender selection is required';
  }

  // Phone Number - Required with format validation
  if (!data.phoneNumber || typeof data.phoneNumber !== 'string') {
    errors.phoneNumber = 'Phone number is required';
  } else if (!isValidPhone(data.phoneNumber)) {
    errors.phoneNumber = 'Invalid phone format. Use format: +1-234-567-8900 or 1234567890';
  }

  // Emergency Contact Name - Required
  if (!data.emergencyContactName || typeof data.emergencyContactName !== 'string') {
    errors.emergencyContactName = 'Emergency contact name is required';
  } else if (data.emergencyContactName.trim().length < 2) {
    errors.emergencyContactName = 'Emergency contact name must be at least 2 characters';
  }

  // Emergency Contact Phone - Required
  if (!data.emergencyContactPhone || typeof data.emergencyContactPhone !== 'string') {
    errors.emergencyContactPhone = 'Emergency contact phone is required';
  } else if (!isValidPhone(data.emergencyContactPhone)) {
    errors.emergencyContactPhone = 'Invalid emergency contact phone format';
  }

  return Object.keys(errors).length === 0 ? null : errors;
};

// STEP 2: MEDICAL HISTORY
const validateMedicalHistory = (data) => {
    console.log('Validating medical history with data:', data);
  const errors = {};

  // Blood Type - Required dropdown
  const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'unknown'];
  if (!data.bloodType || !validBloodTypes.includes(data.bloodType.toUpperCase())) {
    errors.bloodType = 'Valid blood type is required';
  }

  // Current Medications - Optional, max 500 chars
  if (data.currentMedications) {
    if (typeof data.currentMedications !== 'string') {
      errors.currentMedications = 'Current medications must be text';
    } else if (data.currentMedications.length > 500) {
      errors.currentMedications = 'Current medications cannot exceed 500 characters';
    }
  }

  // Known Allergies - Multi-select (can be empty array)
  const validAllergies = ['penicillin', 'aspirin', 'sulfa', 'latex', 'shellfish', 'none', 'other'];
  if (data.knownAllergies) {
    if (!Array.isArray(data.knownAllergies)) {
      errors.knownAllergies = 'Known allergies must be an array';
    } else {
      const invalidAllergies = data.knownAllergies.filter(
        (allergy) => !validAllergies.includes(allergy.toLowerCase())
      );
      if (invalidAllergies.length > 0) {
        errors.knownAllergies = `Invalid allergy selections: ${invalidAllergies.join(', ')}`;
      }
    }
  }

  // Chronic Conditions - Checkboxes (can be empty array)
  const validConditions = ['diabetes', 'hypertension', 'asthma', 'heart_disease', 'arthritis', 'none'];
  if (data.chronicConditions) {
    if (!Array.isArray(data.chronicConditions)) {
      errors.chronicConditions = 'Chronic conditions must be an array';
    } else {
      const invalidConditions = data.chronicConditions.filter(
        (condition) => !validConditions.includes(condition.toLowerCase())
      );
      if (invalidConditions.length > 0) {
        errors.chronicConditions = `Invalid condition selections: ${invalidConditions.join(', ')}`;
      }
    }
  }

  // Previous Surgeries - Optional
  if (data.previousSurgeries) {
    if (typeof data.previousSurgeries !== 'string') {
      errors.previousSurgeries = 'Previous surgeries must be text';
    }
  }

  // Family Medical History - Optional, max 300 chars
  if (data.familyMedicalHistory) {
    if (typeof data.familyMedicalHistory !== 'string') {
      errors.familyMedicalHistory = 'Family medical history must be text';
    } else if (data.familyMedicalHistory.length > 300) {
      errors.familyMedicalHistory = 'Family medical history cannot exceed 300 characters';
    }
  }

  return Object.keys(errors).length === 0 ? null : errors;
};

// STEP 3: INSURANCE DETAILS
const validateInsuranceDetails = (data) => {
  const errors = {};

  // Insurance Provider - Required
  if (!data.insuranceProvider || typeof data.insuranceProvider !== 'string') {
    errors.insuranceProvider = 'Insurance provider is required';
  } else if (data.insuranceProvider.trim().length < 2) {
    errors.insuranceProvider = 'Insurance provider must be at least 2 characters';
  }

  // Insurance ID - Required
  if (!data.insuranceId || typeof data.insuranceId !== 'string') {
    errors.insuranceId = 'Insurance ID is required';
  } else if (data.insuranceId.trim().length < 3) {
    errors.insuranceId = 'Insurance ID must be at least 3 characters';
  }

  // Policy Holder Name - Required
  if (!data.policyHolderName || typeof data.policyHolderName !== 'string') {
    errors.policyHolderName = 'Policy holder name is required';
  } else if (data.policyHolderName.trim().length < 2) {
    errors.policyHolderName = 'Policy holder name must be at least 2 characters';
  }

  // Preferred Doctor - Required and must be valid UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!data.preferredDoctorId || typeof data.preferredDoctorId !== 'string') {
    errors.preferredDoctorId = 'Preferred doctor is required';
  } else if (!uuidRegex.test(data.preferredDoctorId)) {
    errors.preferredDoctorId = 'Invalid doctor ID format (must be valid UUID)';
  }

  // Preferred Time Slot - Required
  const validTimeSlots = ['morning', 'afternoon', 'evening'];
  if (!data.preferredTimeSlot || !validTimeSlots.includes(data.preferredTimeSlot.toLowerCase())) {
    errors.preferredTimeSlot = 'Valid time slot is required (morning/afternoon/evening)';
  }

  // Referral Source - Optional dropdown
  if (data.referralSource) {
    const validReferralSources = ['google', 'friend', 'doctor_referral', 'ad', 'other'];
    if (!validReferralSources.includes(data.referralSource.toLowerCase())) {
      errors.referralSource = 'Invalid referral source';
    }
  }

  // Additional Notes - Optional, max 200 chars
  if (data.additionalNotes) {
    if (typeof data.additionalNotes !== 'string') {
      errors.additionalNotes = 'Additional notes must be text';
    } else if (data.additionalNotes.length > 200) {
      errors.additionalNotes = 'Additional notes cannot exceed 200 characters';
    }
  }

  return Object.keys(errors).length === 0 ? null : errors;
};

// Helper functions
const isValidPhone = (phone) => {
  // Accepts formats: +1-234-567-8900, 1-234-567-8900, (123) 456-7890, 1234567890, etc.
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

const isValidDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

const calculateAge = (birthDate) => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

// Full onboarding validation
const validateCompleteOnboarding = (data) => {
  const allErrors = {};

  const step1Errors = validatePersonalInfo(data.personalInfo || {});
  const step2Errors = validateMedicalHistory(data.medicalHistory || {});
  const step3Errors = validateInsuranceDetails(data.insuranceDetails || {});

  if (step1Errors) Object.assign(allErrors, { personalInfo: step1Errors });
  if (step2Errors) Object.assign(allErrors, { medicalHistory: step2Errors });
  if (step3Errors) Object.assign(allErrors, { insuranceDetails: step3Errors });

  return Object.keys(allErrors).length === 0 ? null : allErrors;
};

module.exports = {
  validatePersonalInfo,
  validateMedicalHistory,
  validateInsuranceDetails,
  validateCompleteOnboarding,
};
