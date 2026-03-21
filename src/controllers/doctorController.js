const supabase = require('../config/database');

const getAssignedPatients = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const { data: patients, error } = await supabase
      .from('patient_doctor_assignments')
      .select('*, patient:users(*), patient_profile:patient_profiles(*)')
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

module.exports = {
  getAssignedPatients,
  getPatientDetails,
  getProfile,
};
