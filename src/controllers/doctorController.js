const supabase = require('../config/database');

const getAssignedPatients = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const { data: patients, error } = await supabase
      .from('patient_doctor_assignments')
      .select('*, patient:patient_doctor_assignments_patient_id_fkey(id, email, full_name), patient_profile:patient_profiles(*)')
      .eq('doctor_id', doctorId);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch patients' });
    }

    res.json({ patients });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPatientDetails = async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user.id;

    // Verify doctor-patient relationship
    const { data: assignment, error: assignmentError } = await supabase
      .from('patient_doctor_assignments')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('patient_id', patientId)
      .single();

    if (assignmentError || !assignment) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Fetch patient details
    const { data: patient, error } = await supabase
      .from('users')
      .select('*, patient_profile:patient_profiles(*)')
      .eq('id', patientId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ patient });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const { data: profile, error } = await supabase
      .from('doctor_profiles')
      .select('*')
      .eq('user_id', doctorId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

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
      .maybeSingle();

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

const updateDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { licenseNumber, specialization, bio, availableSlots } = req.body;

    const { data: profile, error } = await supabase
      .from('doctor_profiles')
      .update({
        license_number: licenseNumber,
        specialization,
        bio: bio || null,
        available_slots: availableSlots,
        updated_at: new Date()
      })
      .eq('user_id', doctorId)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
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

module.exports = {
  getAssignedPatients,
  getPatientDetails,
  getProfile,
  createDoctorProfile,
  updateDoctorProfile
};
