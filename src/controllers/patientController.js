const supabase = require('../config/database');
const {
  validatePersonalInfo,
  validateMedicalHistory,
  validateInsuranceDetails,
  validateCompleteOnboarding,
} = require('../validators/onboardingValidator');

const saveDraft = async (req, res) => {
  try {
    const { step, data } = req.body;
    const patientId = req.user.id;

    // Validate step number
    if (![1, 2, 3].includes(step)) {
      return res.status(400).json({ error: 'Invalid step number. Must be 1, 2, or 3' });
    }

    // Validate data based on step
    let validationError;
    if (step === 1) {
      validationError = validatePersonalInfo(data);
    } else if (step === 2) {
      validationError = validateMedicalHistory(data);
    } else if (step === 3) {
      validationError = validateInsuranceDetails(data);
    }

    if (validationError) {
      return res.status(400).json({ error: 'Validation failed', errors: validationError });
    }

    // Save or update draft
    const { data: savedDraft, error } = await supabase
      .from('onboarding_drafts')
      .upsert({
        patient_id: patientId,
        step,
        data: JSON.stringify(data),
        updated_at: new Date(),
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to save draft' });
    }

    res.json({
      message: `Step ${step} draft saved successfully`,
      draft: {
        ...savedDraft,
        data: JSON.parse(savedDraft.data),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getDraft = async (req, res) => {
  try {
    const patientId = req.user.id;

    const { data: drafts, error } = await supabase
      .from('onboarding_drafts')
      .select('*')
      .eq('patient_id', patientId)
      .order('step', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch draft' });
    }

    // Parse all draft data
    const parsedDrafts = drafts.map((draft) => ({
      ...draft,
      data: JSON.parse(draft.data),
    }));

    res.json({
      drafts: parsedDrafts,
      lastCompletedStep: parsedDrafts.length > 0 ? parsedDrafts[parsedDrafts.length - 1].step : 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const submitOnboarding = async (req, res) => {
  try {
    const { personalInfo, medicalHistory, insuranceDetails } = req.body;
    const patientId = req.user.id;

    // Validate complete onboarding
    const validationErrors = validateCompleteOnboarding({
      personalInfo,
      medicalHistory,
      insuranceDetails,
    });

    if (validationErrors) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: validationErrors,
      });
    }

    // Create patient profile with all onboarding data
    const { data: profile, error: profileError } = await supabase
      .from('patient_profiles')
      .upsert({
        user_id: patientId,
        personal_info: JSON.stringify(personalInfo),
        medical_history: JSON.stringify(medicalHistory),
        insurance_details: JSON.stringify(insuranceDetails),
        onboarding_completed: true,
        completed_at: new Date(),
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return res.status(500).json({ error: 'Failed to create patient profile' });
    }

    // Delete drafts after successful submission
    const { error: deleteError } = await supabase
      .from('onboarding_drafts')
      .delete()
      .eq('patient_id', patientId);

    if (deleteError) {
      console.error('Draft deletion error:', deleteError);
      // Still continue, as profile was created successfully
    }

    // Get or create doctor assignment (using preferred doctor from insurance details)
    const { data: existingAssignment } = await supabase
      .from('patient_doctor_assignments')
      .select('*')
      .eq('patient_id', patientId)
      .maybeSingle();

    if (!existingAssignment) {
      const { error: assignmentError } = await supabase
        .from('patient_doctor_assignments')
        .insert({
          patient_id: patientId,
          doctor_id: insuranceDetails.preferredDoctorId,
          assigned_at: new Date(),
        });

      if (assignmentError) {
        console.error('Assignment error:', assignmentError);
        // Continue - assignment can be done manually later
      }
    }

    // Create chat room for patient and doctor communication
    const roomId = `${patientId}-${insuranceDetails.preferredDoctorId}`;
    const { error: roomError } = await supabase
      .from('chat_rooms')
      .insert({
        id: roomId,
        patient_id: patientId,
        doctor_id: insuranceDetails.preferredDoctorId,
        created_at: new Date(),
      })
      .select();

    // Ignore if room already exists (conflict error is okay)
    if (roomError && !roomError.message.includes('duplicate')) {
      console.error('Room creation error:', roomError);
      // Continue - room creation failure is not fatal
    }

    res.status(201).json({
      message: 'Onboarding completed successfully!',
      profile: {
        ...profile,
        personal_info: JSON.parse(profile.personal_info),
        medical_history: JSON.parse(profile.medical_history),
        insurance_details: JSON.parse(profile.insurance_details),
      },
      doctorId: insuranceDetails.preferredDoctorId,
      roomId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const patientId = req.user.id;

    const { data: profile, error } = await supabase
      .from('patient_profiles')
      .select('*')
      .eq('user_id', patientId)
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }

    if (!profile) {
      return res.status(404).json({ error: 'Patient profile not found. Complete onboarding first.' });
    }

    // Parse JSON fields
    const parsedProfile = {
      ...profile,
      personal_info: JSON.parse(profile.personal_info),
      medical_history: JSON.parse(profile.medical_history),
      insurance_details: JSON.parse(profile.insurance_details),
    };

    res.json({ profile: parsedProfile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAssignedDoctor = async (req, res) => {
  try {
    const patientId = req.user.id;

    const { data: assignment, error } = await supabase
      .from('patient_doctor_assignments')
      .select(
        `
        id,
        doctor_id,
        assigned_at,
        doctor:patient_doctor_assignments_doctor_id_fkey(id, email, full_name)
      `
      )
      .eq('patient_id', patientId)
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch doctor assignment' });
    }

    if (!assignment || !assignment.doctor) {
      return res.status(404).json({ error: 'No doctor assigned yet' });
    }

    res.json({
      doctor: assignment.doctor,
      assignedAt: assignment.assigned_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get onboarding progress
const getOnboardingProgress = async (req, res) => {
  try {
    const patientId = req.user.id;

    const { data: profile, error: profileError } = await supabase
      .from('patient_profiles')
      .select('onboarding_completed, completed_at')
      .eq('user_id', patientId)
      .maybeSingle();

    if (profileError) {
      console.error('Database error:', profileError);
      return res.status(500).json({ error: 'Failed to fetch progress' });
    }

    const { data: drafts, error: draftsError } = await supabase
      .from('onboarding_drafts')
      .select('step')
      .eq('patient_id', patientId)
      .order('step', { ascending: true });

    if (draftsError) {
      console.error('Database error:', draftsError);
      return res.status(500).json({ error: 'Failed to fetch drafts' });
    }

    res.json({
      completed: profile?.onboarding_completed || false,
      completedAt: profile?.completed_at || null,
      savedSteps: drafts.map((d) => d.step),
      currentStep: drafts.length > 0 ? drafts[drafts.length - 1].step + 1 : 1,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  saveDraft,
  getDraft,
  submitOnboarding,
  getProfile,
  getAssignedDoctor,
  getOnboardingProgress,
};
