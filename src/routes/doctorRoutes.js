const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authorizeRole } = require('../middleware/authMiddleware');

// Get assigned patients
router.get('/patients', authorizeRole(['doctor']), doctorController.getAssignedPatients);

// Get patient details
router.get('/patients/:patientId', authorizeRole(['doctor']), doctorController.getPatientDetails);

// Get doctor profile
router.get('/profile', authorizeRole(['doctor']), doctorController.getProfile);

module.exports = router;
